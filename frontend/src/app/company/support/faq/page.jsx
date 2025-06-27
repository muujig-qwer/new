"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const faqs = [
	{
		q: "Lorem ipsum dolor sit amet?",
		a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur.",
	},
	{
		q: "Pellentesque vitae velit ex?",
		a: "Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate.",
	},
	{
		q: "Etiam euismod urna eu?",
		a: "Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim.",
	},
	{
		q: "Nunc pulvinar sapien?",
		a: "Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc.",
	},
	{
		q: "Quisque velit nisi?",
		a: "Quisque velit nisi, pretium ut lacinia in, elementum id enim.",
	},
	{
		q: "Mauris dapibus risus?",
		a: "Mauris dapibus risus quis suscipit vulputate.",
	},
	{
		q: "Consectetur adipiscing elit?",
		a: "Consectetur adipiscing elit. Pellentesque vitae velit ex.",
	},
];

export default function FaqPage() {
	const [open, setOpen] = useState(null);
	const router = useRouter();

	return (
		<div className="max-w-2xl mx-auto px-4 py-10">
			{/* 3 button */}
			<div className="flex gap-4 mb-8">
				<button
					className="px-4 py-2 rounded font-semibold border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
					onClick={() => router.push("/company/support/terms")}
				>
					Үйлчилгээний нөхцөл
				</button>
				<button
					className="px-4 py-2 rounded font-semibold border bg-blue-600 text-white border-blue-600"
					onClick={() => router.push("/company/support/faq")}
				>
					Түгээмэл асуулт & хариулт
				</button>
				<button
					className="px-4 py-2 rounded font-semibold border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
					onClick={() => router.push("/company/support/terms")}
				>
					Нууцлалын бодлого
				</button>
			</div>
			<h1 className="text-2xl font-bold mb-6">Түгээмэл асуулт & хариулт</h1>
			<div className="space-y-4">
				{faqs.map((item, idx) => (
					<div key={idx} className="border rounded-lg bg-white shadow-sm">
						<button
							className="w-full text-left px-4 py-3 font-semibold flex justify-between items-center"
							onClick={() => setOpen(open === idx ? null : idx)}
						>
							<span>
								{idx + 1}. {item.q}
							</span>
							<span className="ml-2">{open === idx ? "▲" : "▼"}</span>
						</button>
						{open === idx && (
							<div className="px-4 pb-4 text-gray-700 text-base">
								{item.a}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}