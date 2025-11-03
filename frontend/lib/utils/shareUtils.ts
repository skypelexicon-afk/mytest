interface ShareOptions {
  title: string;
  price: number;
  id: number;
  type?: 'course' | 'bundle';
}

export function generateShareLinks({ title, price, id, type = 'course' }: ShareOptions) {
  const BASE_URL = 'https://tendingtoinfinityacademy.com';

  const path =
    type === 'bundle'
      ? `/all-courses/exploreBundle/${id}`
      : `/all-courses/explore/${id}`;

  const url = `${BASE_URL}${path}`;
  const message = `Hey! Check out this amazing ${type}: "${title}" for just ₹${price}. Join now: ${url}`;

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
    email: `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(`Check out "${title}"`)}&body=${encodeURIComponent(message)}&tf=1`,
   
  };
}
