'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { dummyTestimonial } from '@/lib/types/dummyTestimonial';
import { FaStar } from 'react-icons/fa';
import Image from 'next/image';

type Testimonial = {
    name: string;
    role: string;
    image: string;
    rating: number;
    feedback: string;
};

const TestimonialsSection: React.FC = () => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div
  className="w-full text-center m-0 p-0 relative overflow-x-hidden"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>
  

        <div className="pb-20 px-4 md:px-0 max-w-7xl mx-auto relative z-10">
            {/*<h2 className="text-4xl font-bold text-center text-gray-900">*/}
            <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                Learner Testimonials
            </h2>
            {/*<p className="text-lg text-center text-gray-600 mt-4 max-w-xl mx-auto">*/}
            <p className="text-lg text-center text-yellow-200 mt-4 max-w-xl mx-auto">
                Real stories from real users—see how we&apos;ve helped them
                grow.
            </p>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-16 px-4">
                {(dummyTestimonial as Testimonial[]).map(
                    (testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            //className="rounded-xl bg-white border border-gray-200 shadow-md p-6 flex flex-col justify-between transition-transform duration-300"
                            className="rounded-xl bg-yellow-200 border border-gray-200 shadow-md p-6 flex flex-col justify-between transition-transform duration-300"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <Image
  //className="h-14 w-14 rounded-full object-cover bg-gray-200"
  className="h-14 w-14 rounded-full object-cover bg-yellow-200"
  src={testimonial.image || '/images/image.png'}
  alt={testimonial.name}
  width={56}
  height={56}
/>

                                <div>
                                    {/*<h3 className="text-lg font-semibold text-gray-900">*/}
                                         <h3 className="text-lg font-semibold text-yellow-900">
                                        {testimonial.name}
                                    </h3>
                                   {/* <p className="text-sm text-gray-500"> */}
                                   <p className="text-sm text-yellow-500">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>

                            <motion.div layout className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i}>
                                        {i < Math.floor(testimonial.rating) ? (
                                            <FaStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ) : (
                                            <FaStar className="w-5 h-5 text-gray-300" />
                                        )}
                                    </div>
                                ))}
                            </motion.div>

                            <motion.p layout // className="text-gray-600 text-sm"
                             className="text-yellow-900 text-sm"
                            >
                                {expandedIndex === index
                                    ? testimonial.feedback
                                    : testimonial.feedback.slice(0, 120) +
                                    (testimonial.feedback.length > 120
                                        ? '...'
                                        : '')}
                            </motion.p>

                            {testimonial.feedback.length > 120 && (
                                <motion.button
                                    layout
                                    //className="mt-4 text-blue-600 text-sm hover:underline"
                                    className="mt-4 text-yellow-600 text-sm hover:underline"
                                    onClick={() =>
                                        setExpandedIndex(
                                            expandedIndex === index
                                                ? null
                                                : index,
                                        )
                                    }
                                >
                                    {expandedIndex === index
                                        ? 'Show less'
                                        : 'Read more'}
                                </motion.button>
                            )}
                        </motion.div>
                    ),
                )}
            </div>
            </div>
        </div>
    );
};

export default TestimonialsSection;
