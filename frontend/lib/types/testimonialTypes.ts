export interface Testimonial {
  name: string;
  role: string;
  image: string;   // typically a path from imported asset
  rating: number;  // e.g., 4.5
  feedback: string;
}