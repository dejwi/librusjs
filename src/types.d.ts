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
  latest?: { [subject: string]: grade[] };
  [semester: string]: {
    [subject: string]: grade[];
  };
}
