import axios from "axios";
import {
  CategoriesApi,
  CommentsApi,
  GradesApi,
  SubjectsApi,
  TeachersApi,
} from "./typesApi";
import { Grade, Grades } from "./types";
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

  const getApi = (url: string) =>
    axios.get(`https://api.librus.pl/2.0/${url}`, {
      headers: { Authorization: token },
    });

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

  const getGrades = async (lastXDays?: number) => {
    const res = await getApi("Grades");
    const data: GradesApi = res.data;
    const gradesFinal: Grades = {};
    await Promise.all([
      fillCategories(),
      fillComments(),
      fillSubjects(),
      fillTeachers(),
    ]);

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
      gradesFinal[semester][subject].push(grade);
    });
    return gradesFinal;
  };

  const getAnything = async (url: string) => {
    const res = await getApi(url);
    return res.data;
  };

  const fillSubjects = async () => {
    if (subjectsApi) return;
    subjectsApi = await getAnything("Subjects");
  };
  const fillTeachers = async () => {
    if (teachersApi) return;
    teachersApi = await getAnything("Users");
  };
  const fillCategories = async () => {
    if (categoriesApi) return;
    categoriesApi = await getAnything("Grades/Categories");
  };
  const fillComments = async () => {
    if (commentsApi) return;
    commentsApi = await getAnything("Grades/Comments");
  };

  const init = await login();
  if (!init) throw new Error("Failed to auth");
  else return { getGrades, getAnything };
};

export default Librus;
