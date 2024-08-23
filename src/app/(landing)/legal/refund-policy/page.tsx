import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund Policy for directt.to",
};

const RefundPolicy = () => {
  return (
    <div className="flex min-h-screen w-full flex-col py-6 leading-8">
      <div className="relative py-3">
        <div className="relative px-4 py-10 shadow-lg sm:rounded-3xl">
          <div className="mx-auto max-w-5xl">
            <h1 className="mb-6 text-2xl font-semibold">Refund Policy</h1>

            <section className="mb-6">
              <p>
                At directt.to, we strive to provide the best experience for our users. However, if
                you are not satisfied with your subscription, you may request a refund under the
                following conditions:
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Eligibility for Refund</h2>
              <p>
                Refunds are only available within the first 14 days of your subscription. After 14
                days, no refunds will be processed.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Refund Process</h2>
              <p>
                To request a refund, please contact our support team at{" "}
                <a href="mailto:support@directt.to" className="text-blue-600 hover:underline">
                  support@directt.to
                </a>
                . Once your request is received and approved, your refund will be processed within
                2-5 business days.
              </p>
              <p className="mt-2">
                Please include the following information in your refund request:
              </p>
              <ul className="mt-2 list-disc pl-5">
                <li>Your account email address</li>
                <li>Date of subscription</li>
                <li>Reason for requesting a refund</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Exceptions</h2>
              <p>While we aim to accommodate all eligible refund requests, please note that:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>
                  Refunds may be denied if we detect any abuse of the refund policy or violation of
                  our Terms of Service.
                </li>
                <li>
                  We reserve the right to suspend or terminate accounts that frequently subscribe
                  and request refunds.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Cancellation vs. Refund</h2>
              <p>
                Remember that cancelling your subscription is different from requesting a refund.
                You can cancel your subscription at any time, and you'll continue to have access to
                Pro features until the end of your current billing cycle.
              </p>
            </section>

            <section className="mb-6">
              <p>
                We hope you enjoy the Pro tier of directt.to, and we appreciate your business. If
                you have any questions about our refund policy, please don't hesitate to contact our
                support team.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
