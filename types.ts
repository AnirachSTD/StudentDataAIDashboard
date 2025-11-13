
export interface Student {
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  status: string;
  year: number;
  gpax: number;
  program: string;
  room: string;
  curriculum: string;
  academicYear: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}