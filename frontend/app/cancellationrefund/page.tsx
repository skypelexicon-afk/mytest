import React from "react";
import Footer from "@/components/LandingComponents/Footer";
//
const CancellationRefundPage = () => {
  return (
    <div>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl text-[rgb(108,76,241)] font-bold text-center mb-4">
          Cancellation & Refund Policy
        </h1>
        <p className="text-center text-[rgb(108,76,241)] mb-8">
          Last Updated: 23.07.2025
        </p>

        <section className="space-y-6 text-black text-lg">
          <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold">
            No Refund Policy
          </h2>
          <p>
            At <strong>Tending To Infinity</strong>, we strive to deliver high-quality courses,
            resources, and learning experiences through our platform. To ensure
            fairness and protect the integrity of our content, we operate under
            a strict <strong>No Refund Policy</strong>. By making a purchase,
            you agree to the following terms:
          </p>

          <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold mt-6">
            Terms of the No Refund Policy
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>All Sales Are Final:</strong> All purchases made on our
              platform (including courses, subscriptions, and bundled offers)
              are final. <strong>No refunds or cancellations</strong> will be issued under any
              circumstances after payment is completed.
            </li>
            <li>
              <strong>Immediate Access to Content:</strong> Once payment is
              processed, users gain <strong>instant access</strong> to the digital course
              materials. This access constitutes full delivery of the service,
              and therefore, refunds are not applicable.
            </li>
            <li>
  <strong>Technical Support:</strong> If you encounter any technical
  issues while accessing your course, please reach out to our
  support team at <br />
  
   <a
    href="mailto:support@tendingtoinfinityacademy.com"
    className="text-[rgb(108,76,241)] underline"
  >
    support@tendingtoinfinityacademy.com
  </a>.
  <br />
  Our team is committed to resolving technical issues promptly and
  efficiently.
</li>

            <li>
              <strong>Course Previews & Descriptions:</strong> We encourage all
              users to <strong>review course previews, descriptions, learning outcomes,
                and instructor profiles</strong> before making a purchase decision. This
              ensures that you make informed choices aligned with your learning
              goals.
            </li>
            <li>
              <strong>Special Offers & Discounts:</strong> Promotional offers,
              discount codes, or bundled course deals are <strong>non-refundable</strong> and
              cannot be exchanged or transferred once the payment is completed.
            </li>
          </ul>

          <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold mt-6">
            Contact Us
          </h2>
          <p>
            If you have any questions, concerns, or need assistance, please
            contact us:
          </p>
          <ul className="list-disc ml-6 space-y-2">
           <li>
  
   <a
    href="mailto:support@tendingtoinfinityacademy.com"
    className="text-[rgb(108,76,241)] underline"
  >
    support@tendingtoinfinityacademy.com
  </a>.
</li>

            <li>
              🌐 Website:{" "}
              <a
                href="https://tendingtoinfinityacademy.com/"
                className="text-[rgb(108,76,241)] underline"
                target="_blank"
              >
                https://tendingtoinfinityacademy.com/
              </a>
            </li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationRefundPage;
