export interface Grade {
  grade: string;
  weight: number;
  category: string;
  teacher: string;
  comment: string;
  date: string;
  isFinal: boolean;
  isFinalProposition: boolean;
  isSemester: boolean;
  isSemesterProposition: boolean;
  toAverage: boolean;
}

export interface Grades {
  latest?: { [subject: string]: Grade[] };
  mostRecent?: { subject: string; grade: Grade };
  [semester: string]: {
    [subject: string]: Grade[];
  };
}

export type TimetableLesson = {
  name: string;
  room: string;
  lessonNo: string;
  teacher: string;
  hourFrom: string;
  hourTo: string;
  isCanceled: boolean;
  isSubstitutionClass: boolean;
  original?: string;
} | null;

export interface Timetable {
  [day: string]: TimetableLesson[];
}
