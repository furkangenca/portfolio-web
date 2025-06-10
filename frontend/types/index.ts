export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
  tags: string[];
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
} 