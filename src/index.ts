import axios from "axios";
import {
  CategoriesApi,
  ClassroomsApi,
  CommentsApi,
  GradesApi,
  SchoolFreeDaysApi,
  SubjectsApi,
  TeachersApi,
  TimetablesApi,
} from "./typesApi";
import { Grade, Grades, Timetable, TimetableLesson } from "./types";
import moment from "moment";

const isDaysAgo = (days: number, date: string) => {
  const xAgo = moment().subtract(days, "d");
  return moment(date).isAfter(xAgo);
};

const Librus = async (username: string, password: string) => {
  let token = "";
  let subjectsApi: SubjectsApi | null = null;
  let teachersApi: TeachersApi | null = null;
  let categoriesApi: CategoriesApi | null = null;
  let commentsApi: CommentsApi | null = null;
  let classroomsApi: ClassroomsApi | null = null;
  let freeDaysApi: SchoolFreeDaysApi | null = null;

  const login = async () => {
    const res = await axios.post(
      "https://api.librus.pl/OAuth/Token",
      `username=${username}&password=${password}&librus_long_term_token=1&grant_type=password`,
      {
        headers: {
          Authorization:
            "Basic Mjg6ODRmZGQzYTg3YjAzZDNlYTZmZmU3NzdiNThiMzMyYjE=",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (res.status !== 200) return false;

    token = `Bearer ${res.data.access_token}`;
    return true;
  };

  const getApi = async (url: string) => {
    const res = await axios.get(`https://api.librus.pl/2.0/${url}`, {
      headers: { Authorization: token },
    });
    return res.data;
  };

  const getGrades = async (getMostRecent?: boolean, lastXDays?: number) => {
    const data: GradesApi = await getApi("Grades");
    const gradesFinal: Grades = {};
    await Promise.all([
      fillCategories(),
      fillComments(),
      fillSubjects(),
      fillTeachers(),
    ]);
    let mostRecent: Grade;

    data.Grades.forEach((e) => {
      const subject = subjectsApi?.Subjects.find((s) => s.Id === e.Subject.Id)
        ?.Name as string;
      const category = categoriesApi?.Categories.find(
        (c) => c.Id === e.Category.Id
      );
      const teacherData = teachersApi?.Users.find((t) => t.Id === e.AddedBy.Id);
      const teacher = teacherData?.FirstName + " " + teacherData?.LastName;

      let comment: string;
      if (e.Comments) {
        comment = commentsApi?.Comments.find(
          // @ts-ignore - ts is mad at me
          (c) => c.Id === e.Comments[0].Id
        )?.Text as string;
      } else comment = "Brak opisu";

      const semester = "semester" + e.Semester;
      if (!gradesFinal[semester]) gradesFinal[semester] = {};
      if (!gradesFinal[semester][subject]) gradesFinal[semester][subject] = [];

      const grade: Grade = {
        grade: e.Grade,
        weight: category?.Weight as number,
        category: category?.Name as string,
        teacher,
        comment,
        date: e.AddDate,
        isFinal: e.IsFinal,
        isFinalProposition: e.IsFinalProposition,
        isSemester: e.IsSemester,
        isSemesterProposition: e.IsSemesterProposition,
        toAverage: category?.CountToTheAverage as boolean,
      };
      if (lastXDays) {
        if (isDaysAgo(lastXDays, grade.date)) {
          if (!gradesFinal.latest) gradesFinal.latest = {};
          if (!gradesFinal.latest[subject]) gradesFinal.latest[subject] = [];
          gradesFinal.latest[subject].push(grade);
        }
      }
      if (getMostRecent) {
        if (!mostRecent) mostRecent = grade;
        else {
          if (moment(grade.date).isAfter(moment(mostRecent.date)))
            mostRecent = grade;
        }
        gradesFinal.mostRecent = { subject, grade: mostRecent };
      }
      gradesFinal[semester][subject].push(grade);
    });
    return gradesFinal;
  };

  const getTimetable = async (weekStart?: string) => {
    const url = weekStart ? `Timetables?weekStart=${weekStart}` : "Timetables";
    const data: TimetablesApi = await getApi(url);
    await Promise.all([fillSubjects(), fillClassrooms(), fillFreeDays()]);

    const timetableFinal: Timetable = {};

    const getClassroom = (id: string) => {
      return classroomsApi?.Classrooms.find(
        (c) => c.Id.toString() === id.toString()
      )?.Symbol as string;
    };

    // loop each day
    Object.entries(data.Timetable).forEach((entry) => {
      const [key, value] = entry;

      // check if is a free day
      let freeDayName = null;
      freeDaysApi?.SchoolFreeDays.forEach((d) => {
        if (moment(key).isBetween(d.DateFrom, d.DateTo, null, "[]"))
          freeDayName = d.Name;
      });
      if (freeDayName)
        return (timetableFinal[key] = { isFreeDay: true, name: freeDayName });

      // loop each lesson
      const newLessons: TimetableLesson[] = value.map((e) => {
        if (!e.length) return null;
        const x = e[0];
        const teacher = x.Teacher.FirstName + " " + x.Teacher.LastName;
        const out: NonNullable<TimetableLesson> = {
          name: x.Subject.Name,
          lessonNo: x.LessonNo,
          teacher,
          room: "",
          hourFrom: x.HourFrom,
          hourTo: x.HourTo,
          isCanceled: x.IsCanceled,
          isSubstitutionClass: x.IsSubstitutionClass,
        };
        if (x.OrgClassroom)
          out.room = getClassroom(x.OrgClassroom.Id.toString());
        if (x.Classroom) out.room = getClassroom(x.Classroom.Id.toString());
        if (x.IsSubstitutionClass) {
          const subject = subjectsApi?.Subjects.find(
            (s) => s.Id.toString() === x.OrgSubject?.Id.toString()
          )?.Name as string;
          out.original = subject;
        }
        return out;
      });

      timetableFinal[key] = newLessons;
    });
    return timetableFinal;
  };

  const fillSubjects = async () => {
    if (subjectsApi) return;
    subjectsApi = await getApi("Subjects");
  };
  const fillTeachers = async () => {
    if (teachersApi) return;
    teachersApi = await getApi("Users");
  };
  const fillCategories = async () => {
    if (categoriesApi) return;
    categoriesApi = await getApi("Grades/Categories");
  };
  const fillComments = async () => {
    if (commentsApi) return;
    commentsApi = await getApi("Grades/Comments");
  };
  const fillClassrooms = async () => {
    if (classroomsApi) return;
    classroomsApi = await getApi("Classrooms");
  };
  const fillFreeDays = async () => {
    if (freeDaysApi) return;
    freeDaysApi = await getApi("SchoolFreeDays");
  };

  const init = await login();
  if (!init) throw new Error("Failed to auth");
  else return { getGrades, getApi, getTimetable };
};

export default Librus;
