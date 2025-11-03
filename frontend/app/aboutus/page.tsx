import React from "react";
import Footer from "@/components/LandingComponents/Footer";

const AboutUsPage = () => {
  return (
    <div >
        <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl text-[rgb(108,76,241)] font-bold text-center mb-4">About Us</h1>
      <p className="text-center text-[rgb(108,76,241)] mb-8">Updated ON: 13.10.2024</p>

      <section className="space-y-6">
        <p className="text-lg text-black">
          Welcome to <span className="font-semibold text-[rgb(108,76,241)]">Tending to Infinity!</span>
        </p>
        <p className="text-lg text-black">
          At Tending to Infinity, we are dedicated to empowering learners and fostering growth in the ever-evolving
          landscape of education. Based in Kolkata, India, we provide innovative learning solutions designed to meet
          the needs of our diverse audience. Our mission is to create an inclusive environment where students of all
          backgrounds can thrive and achieve their academic goals.
        </p>

        <h2 className="text-2xl font-semibold text-[rgb(108,76,241)] mt-8">Who We Are</h2>
        <p className="text-lg text-black">
          Our team comprises passionate educators, industry experts, and technology enthusiasts committed to delivering
          high-quality educational content. With years of experience in teaching and a deep understanding of the
          challenges faced by students today, we strive to make learning accessible and enjoyable for everyone.
        </p>

        <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold mt-8">What We Do</h2>
        <p className="text-lg text-black">
          We offer a range of courses and resources tailored to the needs of our learners. From foundational subjects to
          advanced topics, our curriculum is designed to inspire curiosity and foster critical thinking. We utilize the
          latest technologies and teaching methodologies to ensure our students receive the best possible education.
        </p>

        <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold mt-8">Our Values</h2>
        <ul className="list-disc list-inside text-lg text-black space-y-2">
          <li>
            <strong>Integrity:</strong> We uphold the highest standards of honesty and transparency in all our interactions.
          </li>
          <li>
            <strong>Innovation:</strong> We continuously seek new ways to enhance the learning experience and adapt to the changing educational landscape.
          </li>
          <li>
            <strong>Inclusivity:</strong> We believe in providing equal opportunities for all learners, regardless of their background or circumstances.
          </li>
          <li>
            <strong>Collaboration:</strong> We foster a supportive community that encourages collaboration among students, educators, and industry professionals.
          </li>
        </ul>

        <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold mt-8">Join Us on This Journey!</h2>
        <p className="text-lg text-black">
          We invite you to explore our courses, engage with our content, and be a part of our growing community. Together,
          we can unlock the potential within each learner and tend to their journey of growth and success.
        </p>

       <p className="text-lg text-black">
  For more information or inquiries, feel free to contact us at{" "}
  <a
    href="mailto:support@tendingtoinfinityacademy.com"
    className="text-[rgb(108,76,241)] underline"
  >
    support@tendingtoinfinityacademy.com
  </a>.
</p>


      </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
