interface grade {
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
}

export interface Grades {
  latest?: grade[];
  [semester: string]: {
    [subject: string]: grade[];
  };
}
