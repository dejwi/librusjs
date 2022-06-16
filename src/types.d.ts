export interface Grades {
  [semester: string]: {
    [subject: string]: {
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
    }[];
  };
}
