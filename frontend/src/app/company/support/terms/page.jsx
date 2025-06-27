"use client";
import { useState } from "react";

const tabs = [
  { key: "terms", label: "Үйлчилгээний нөхцөл" },
  { key: "faq", label: "Түгээмэл асуулт & хариулт" },
  { key: "privacy", label: "Нууцлалын бодлого" },
];

export default function SupportTermsPage() {
  const [activeTab, setActiveTab] = useState("terms");

  // Tab-уудыг path-аар холбох
  function handleTab(tab) {
    if (tab === "terms") setActiveTab("terms");
    if (tab === "faq") setActiveTab("faq");
    if (tab === "privacy") window.location.href = "/company/support/privacy";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded font-semibold border ${
              activeTab === tab.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => handleTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Үйлчилгээний нөхцөл */}
      {activeTab === "terms" && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Үйлчилгээний нөхцөл</h1>
          <div className="prose max-w-none">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec dictum nisi urna at sapien.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</p>
            <h2 className="font-bold mt-4 mb-2">1. Ерөнхий нөхцөл</h2>
            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li>Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</li>
              <li>Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.</li>
              <li>Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.</li>
              <li>Quisque velit nisi, pretium ut lacinia in, elementum id enim.</li>
              <li>
                <ul>
                  <li>Lorem – Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                  <li>Ipsum – Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</li>
                  <li>Dolor – Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.</li>
                  <li>Sit – Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.</li>
                  <li>Amet – Quisque velit nisi, pretium ut lacinia in, elementum id enim.</li>
                </ul>
              </li>
            </ul>
            <h2 className="font-bold mt-4 mb-2">2. Хэрэглэгчийн бүртгэл</h2>
            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Түгээмэл асуулт & хариулт */}
      {activeTab === "faq" && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Түгээмэл асуулт & хариулт</h1>
          <div className="prose max-w-none">
            <ul className="space-y-4">
              <li>
                <strong>1. Lorem ipsum dolor sit amet?</strong>
                <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur.</div>
              </li>
              <li>
                <strong>2. Pellentesque vitae velit ex?</strong>
                <div>Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</div>
              </li>
              <li>
                <strong>3. Etiam euismod urna eu?</strong>
                <div>Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.</div>
              </li>
              <li>
                <strong>4. Nunc pulvinar sapien?</strong>
                <div>Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.</div>
              </li>
              <li>
                <strong>5. Quisque velit nisi?</strong>
                <div>Quisque velit nisi, pretium ut lacinia in, elementum id enim.</div>
              </li>
              <li>
                <strong>6. Mauris dapibus risus?</strong>
                <div>Mauris dapibus risus quis suscipit vulputate.</div>
              </li>
              <li>
                <strong>7. Consectetur adipiscing elit?</strong>
                <div>Consectetur adipiscing elit. Pellentesque vitae velit ex.</div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Нууцлалын бодлого */}
      {activeTab === "privacy" && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Нууцлалын бодлого</h1>
          <div className="prose max-w-none">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec dictum nisi urna at sapien.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</p>
            <h2 className="font-bold mt-4 mb-2">1. Нэр томьёоны тодорхойлолт</h2>
            <ul>
              <li><strong>Lorem</strong> – Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li><strong>Ipsum</strong> – Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</li>
              <li><strong>Dolor</strong> – Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.</li>
              <li><strong>Sit</strong> – Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.</li>
              <li><strong>Amet</strong> – Quisque velit nisi, pretium ut lacinia in, elementum id enim.</li>
            </ul>
            <h2 className="font-bold mt-4 mb-2">2. Цуглуулж буй мэдээлэл</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.</p>
            <ul>
              <li>Lorem ipsum</li>
              <li>Dolor sit amet</li>
              <li>Consectetur adipiscing</li>
              <li>Elit Pellentesque</li>
              <li>Vitae velit ex</li>
              <li>Mauris dapibus risus</li>
              <li>Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.</li>
            </ul>
            <h2 className="font-bold mt-4 mb-2">3. Мэдээллийг хэрхэн ашигладаг вэ?</h2>
            <ul>
              <li>Lorem ipsum dolor sit amet</li>
              <li>Consectetur adipiscing elit</li>
              <li>Pellentesque vitae velit ex</li>
              <li>Mauris dapibus risus quis suscipit</li>
              <li>Vulputate et, pretium ut lacinia</li>
              <li>Elementum id enim</li>
            </ul>
            <h2 className="font-bold mt-4 mb-2">4. Гуравдагч этгээдийн үйлчилгээ ба мэдээлэл хуваалцах</h2>
            <ul>
              <li>Lorem ipsum dolor sit amet</li>
              <li>Consectetur adipiscing elit</li>
            </ul>
            <h2 className="font-bold mt-4 mb-2">5. Мэдээллийг хадгалах хугацаа</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.</p>
            <h2 className="font-bold mt-4 mb-2">6. Таны эрх</h2>
            <ul>
              <li>Lorem ipsum dolor sit amet</li>
              <li>Consectetur adipiscing elit</li>
              <li>Pellentesque vitae velit ex</li>
            </ul>
            <h2 className="font-bold mt-4 mb-2">7. Аюулгүй байдлын арга хэмжээ</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.</p>
            <h2 className="font-bold mt-4 mb-2">8. Хүүхдийн нууцлал</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.</p>
            <h2 className="font-bold mt-4 mb-2">9. Өөрчлөлт оруулах эрх</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.</p>
            <h2 className="font-bold mt-4 mb-2">10. Холбоо барих</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.<br />
              Pellentesque vitae velit ex.<br />
              Mauris dapibus risus quis suscipit vulputate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}