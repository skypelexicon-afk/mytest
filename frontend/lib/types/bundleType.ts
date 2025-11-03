// lib/types/bundleType.ts
import { Course } from './courseType';

export interface Bundle {
  id: number;
  title: string;
  hero_image: string;
  description: string;
  bundle_price: number;
  original_price: number;
  discount_label: string;
  total_courses?: number; // you calculate this on backend
  courses: Course[]; // for details page
}
