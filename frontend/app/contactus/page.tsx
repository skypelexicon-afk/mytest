import React from "react";
import Footer from "@/components/LandingComponents/Footer";
//
const ContactUsPage = () =>{
    return(
        <div>
             <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-[rgb(108,76,241)] text-center mb-4">Contact Us</h1>
      <p className="text-center text-black mb-8">
        We would love to hear from you! Whether you have questions, feedback, or
        need assistance, feel free to reach out to us.
      </p>

      <section className="space-y-6 text-black text-lg">
        <div>
          <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold mb-2">Phone</h2>
<p>
 <a
  href="mailto:support@tendingtoinfinityacademy.com"
  className="text-black underline"
>
  support@tendingtoinfinityacademy.com
</a>

</p>

            <div className="flex items-center justify-center md:justify-start gap-2">
                  
                  <span className="whitespace-nowrap text-m">
                    Mon – Sat: <span >6:00 PM – 8:00 PM</span>
                  </span>
                </div>
        </div>

        <div>
          <h2 className="text-2xl text-[rgb(108,76,241)] font-semibold mb-2">Address</h2>
          <p>
            Kolkata, West Bengal
            <br />
            India
          </p>
        </div>
      </section>

      
    </div>
<Footer />
        </div>
    )
}
export default ContactUsPage;