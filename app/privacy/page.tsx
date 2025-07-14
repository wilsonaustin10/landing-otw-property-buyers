import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">1. Introduction</h2>
              <p>
                OTW Property Buyers> ("we," "our," or "us") respects your privacy and is committed to protecting 
                it through our compliance with this policy. This policy describes the types of information we 
                may collect from you or that you may provide when you visit our website and our practices for 
                collecting, using, maintaining, protecting, and disclosing that information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">2. Information We Collect</h2>
              <p>We collect several types of information from and about users of our website, including:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  Personal information such as name, email address, telephone number, and property address.
                </li>
                <li>
                  Information about your property that you voluntarily provide to us.
                </li>
                <li>
                  Information about your internet connection, the equipment you use to access our website, 
                  and usage details.
                </li>
                <li>
                  Information collected through cookies, web beacons, and other tracking technologies.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">3. How We Use Your Information</h2>
              <p>We use information that we collect about you or that you provide to us:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>To present our website and its contents to you.</li>
                <li>To provide you with information, products, or services that you request from us.</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To carry out our obligations and enforce our rights.</li>
                <li>To notify you about changes to our website or any products or services we offer.</li>
                <li>In any other way we may describe when you provide the information.</li>
                <li>For any other purpose with your consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">4. Disclosure of Your Information</h2>
              <p>We may disclose aggregated information about our users without restriction. We may disclose 
                personal information that we collect or you provide as described in this privacy policy:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>To our subsidiaries and affiliates.</li>
                <li>To contractors, service providers, and other third parties we use to support our business.</li>
                <li>To a buyer or other successor in the event of a merger, divestiture, restructuring, 
                  reorganization, dissolution, or other sale or transfer of some or all of our assets.</li>
                <li>To fulfill the purpose for which you provide it.</li>
                <li>For any other purpose disclosed by us when you provide the information.</li>
                <li>With your consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">5. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track the activity on our website and 
                hold certain information. Cookies are files with a small amount of data which may include 
                an anonymous unique identifier. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">6. Data Security</h2>
              <p>
                We have implemented measures designed to secure your personal information from accidental 
                loss and from unauthorized access, use, alteration, and disclosure. However, the transmission 
                of information via the internet is not completely secure. We cannot guarantee the security of 
                your personal information transmitted to our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">7. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy 
                practices or the content of such websites. We encourage you to review the privacy policies of 
                any third-party websites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">8. Children's Privacy</h2>
              <p>
                Our website is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">9. California Privacy Rights</h2>
              <p>
                If you are a California resident, California law may provide you with additional rights 
                regarding our use of your personal information. To learn more about your California privacy 
                rights, visit our CCPA Privacy Notice for California Residents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">10. Changes to Our Privacy Policy</h2>
              <p>
                It is our policy to post any changes we make to our privacy policy on this page. If we make 
                material changes to how we treat our users' personal information, we will notify you through 
                a notice on the website home page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">11. Contact Information</h2>
              <p>
                To ask questions or comment about this privacy policy and our privacy practices, contact us at: 
                <br />
                <a href="mailto:" className="text-primary hover:underline">
                  
                </a>
                <br />
                <a href="tel:" className="text-primary hover:underline">
                  
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 