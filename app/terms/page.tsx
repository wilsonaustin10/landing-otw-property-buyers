import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the website of NexStep HomeBuyers LLC ("Company," "we," "us," or "our"), you agree to comply 
                with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">2. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
                material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
                a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">3. Services</h2>
              <p>
                NexStep HomeBuyers LLC provides services related to real estate, including but not limited to buying properties 
                in various conditions. The Company is not a real estate agency but operates as a property investment company 
                that purchases properties directly from sellers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">4. User Representations</h2>
              <p>By using our website, you represent and warrant that:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>You have the legal capacity to enter into these Terms.</li>
                <li>You are at least 18 years old.</li>
                <li>You will not use the website for any illegal or unauthorized purpose.</li>
                <li>Your use of the website will not violate any applicable law or regulation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">5. Property Information</h2>
              <p>
                When you submit information about your property through our website, you represent that all information 
                provided is accurate and complete to the best of your knowledge. We will use this information to evaluate 
                your property and potentially make an offer to purchase it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">6. No Guarantee of Offers</h2>
              <p>
                Submitting your information through our website does not guarantee that we will make an offer on your property. 
                All offers are subject to our evaluation process and are made at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">7. Intellectual Property</h2>
              <p>
                The website and its original content, features, and functionality are owned by NexStep HomeBuyers LLC and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property or 
                proprietary rights laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">8. User Content</h2>
              <p>
                By submitting content to our website, you grant us a non-exclusive, perpetual, irrevocable, royalty-free, 
                worldwide license to use, reproduce, modify, adapt, publish, translate, and distribute it in any media.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">9. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites or services that are not owned or controlled by 
                NexStep HomeBuyers LLC. We have no control over, and assume no responsibility for, the content, privacy policies, 
                or practices of any third-party websites or services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">10. Limitation of Liability</h2>
              <p>
                In no event shall NexStep HomeBuyers LLC, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
                inability to access or use the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">11. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless NexStep HomeBuyers LLC and its licensees and licensors, and their 
                employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, 
                losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">12. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard 
                to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be 
                considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">13. Severability</h2>
              <p>
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions 
                of these Terms will remain in effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">14. Entire Agreement</h2>
              <p>
                These Terms constitute the entire agreement between us regarding our website and supersede and replace any 
                prior agreements we might have had between us regarding the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">15. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
                <br />
                <a href="mailto:" className="text-primary hover:underline">
                  
                </a>
                <br />
                <a href="tel:(636)238-5598" className="text-primary hover:underline">
                  (636)238-5598
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 