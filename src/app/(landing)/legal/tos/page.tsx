import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for directt.to",
};

const TermsOfService = () => {
  return (
    <div className="flex min-h-screen w-full flex-col py-6 leading-8">
      <div className="relative py-3">
        <div className="relative px-4 py-10 shadow-lg sm:rounded-3xl">
          <div className="mx-auto max-w-5xl">
            <h1 className="mb-6 text-2xl font-semibold">Terms of Service</h1>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing or using directt.to ("Service"), you agree to comply with and be bound
                by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not
                use the Service.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">2. Service Overview</h2>
              <p>
                directt.to offers a subscription-based Pro tier that provides additional features to
                users. The subscription fee is $4.99 per month, recurring until canceled by the
                user.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">3. Subscription and Payment</h2>
              <ul className="list-disc pl-5">
                <li>By subscribing to the Pro tier, you agree to pay the monthly fee of $4.99.</li>
                <li>
                  Payments will be charged on a recurring basis until you cancel your subscription.
                </li>
                <li>
                  You can cancel your subscription at any time. Your subscription will remain active
                  until the end of the billing cycle.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">4. Refund Policy</h2>
              <p>
                Refunds are only available within the first 14 days of your subscription. If you
                request a refund within this period, the full amount will be returned to you. After
                14 days, no refunds will be provided.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">5. No Free Trial</h2>
              <p>
                directt.to does not offer any free trials. Access to the Pro tier is granted only
                upon payment of the subscription fee.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">6. No Collection of Personal Data</h2>
              <p>
                We do not collect or store personal data. Your use of the Service does not require
                you to provide personal information.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">7. Modification of Terms</h2>
              <p>
                directt.to reserves the right to modify these Terms at any time. Changes will be
                effective upon posting. Your continued use of the Service after such changes
                constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">8. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of local,
                state, national, or international laws.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
