interface Id_Url {
  Id: number;
  Url: string;
}

export interface GradesApi {
  Grades: {
    Id: number;
    Lesson: Id_Url;
    Subject: Id_Url;
    Student: Id_Url;
    Category: Id_Url;
    AddedBy: Id_Url;
    Grade: string;
    Date: string;
    AddDate: string;
    Semester: number;
    IsConstituent: boolean;
    IsSemester: boolean;
    IsSemesterProposition: boolean;
    IsFinal: boolean;
    IsFinalProposition: boolean;
    Comments?: Id_Url[];
  }[];
}

export interface SubjectsApi {
  Subjects: {
    Id: number;
    Name: string;
    No: number;
    Short: string;
    IsExtracurricular: boolean;
    IsBlockLesson: boolean;
  }[];
}

export interface CategoriesApi {
  Categories: {
    Id: number;
    Color: Id_Url;
    Name: string;
    AdultsExtramural: boolean;
    AdultsDaily: boolean;
    Standard: boolean;
    IsReadOnly: string;
    Weight?: number;
    CountToTheAverage: boolean;
    BlockAnyGrades: boolean;
    ObligationToPerform: boolean;
    IsSemestralProposition: boolean;
  }[];
}

export interface TeachersApi {
  Users: {
    Id: number;
    AccountId: string;
    FirstName: string;
    LastName: string;
    IsEmployee: boolean;
    GroupId: number;
  }[];
}

export interface CommentsApi {
  Comments: {
    Id: number;
    AddedBy: Id_Url;
    Grade: Id_Url;
    Text: string;
  }[];
}

type TimetablesApiEntry =
  | [
      {
        Lesson: Id_Url;
        Classroom?: Id_Url;
        OrgClassroom?: Id_Url;
        DateFrom: Id_Url;
        DateTo: string;
        LessonNo: string;
        TimetableEntry: Id_Url;
        DayNo: string;
        Subject: { Id: string; Name: string; Short: string; Url: string };
        Teacher: {
          Id: string;
          FirstName: string;
          LastName: string;
          Url: string;
        };
        IsSubstitutionClass: boolean;
        IsCanceled: boolean;
        SubstitutionNote?: any;
        HourFrom: string;
        HourTo: string;
        VirtualClass: Id_Url;
        VirtualClassName: string;
        OrgSubject?: Id_Url;
      }
    ]
  | [];

export interface TimetablesApi {
  Timetable: {
    [date: string]: TimetablesApiEntry[];
  };
}

export interface ClassroomsApi {
  Classrooms: {
    Id: number;
    Name: string;
    Symbol: string;
    Size: number;
    SchoolCommonRoom: boolean;
  }[];
}

export interface SchoolFreeDaysApi {
  SchoolFreeDays: {
    Id: number;
    Name: string;
    DateFrom: string;
    DateTo: string;
  }[];
}
