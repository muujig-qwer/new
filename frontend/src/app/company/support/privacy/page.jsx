"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const tabs = [
  { key: "terms", label: "Үйлчилгээний нөхцөл", path: "/company/support/terms" },
  { key: "faq", label: "Түгээмэл асуулт & хариулт", path: "/company/support/faq" },
  { key: "privacy", label: "Нууцлалын бодлого", path: "/company/support/privacy" },
];

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* 3 button */}
      <div className="flex gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded font-semibold border ${
              tab.key === "privacy"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => router.push(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <h1 className="text-2xl font-bold mb-4">Нууцлалын бодлого</h1>
      <div className="prose max-w-none">
        <p>
          <strong>Lorem Ipsum</strong> dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec dictum nisi urna at sapien.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.
        </p>
        <h2 className="font-bold mt-4 mb-2">1. Нэр томьёоны тодорхойлолт</h2>
        <ul>
          <li>
            <strong>Lorem</strong> – Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </li>
          <li>
            <strong>Ipsum</strong> – Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.
          </li>
          <li>
            <strong>Dolor</strong> – Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.
          </li>
          <li>
            <strong>Sit</strong> – Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.
          </li>
          <li>
            <strong>Amet</strong> – Quisque velit nisi, pretium ut lacinia in, elementum id enim.
          </li>
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
          <li>
            Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.
          </li>
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
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.
        </p>
        <h2 className="font-bold mt-4 mb-2">6. Таны эрх</h2>
        <ul>
          <li>Lorem ipsum dolor sit amet</li>
          <li>Consectetur adipiscing elit</li>
          <li>Pellentesque vitae velit ex</li>
        </ul>
        <h2 className="font-bold mt-4 mb-2">7. Аюулгүй байдлын арга хэмжээ</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.
        </p>
        <h2 className="font-bold mt-4 mb-2">8. Хүүхдийн нууцлал</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.
        </p>
        <h2 className="font-bold mt-4 mb-2">9. Өөрчлөлт оруулах эрх</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.
        </p>
        <h2 className="font-bold mt-4 mb-2">10. Холбоо барих</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.<br />
          Pellentesque vitae velit ex.<br />
          Mauris dapibus risus quis suscipit vulputate.
        </p>
      </div>
    </div>
  );
}