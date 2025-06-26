"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const faqs = [
	{
		q: "Бөөндье - Дараа төлөх нөхцөл",
		a: "Та борлуулалтын албатай холбогдон бүтээгдэхүүн нийлүүлэх гэрээ хийсний үндсэн дээр сар бүрийн 15-ний өдөр тооцоо нийлэх нөхцөлтэйгөөр хүссэн бараагаа, хүссэн хэмжээгээрээ захиалан авах боломжтой.",
	},
	{
		q: "Хэтэвч доторх мөнгөө хэрхэн ашиглах вэ?",
		a: "Та захиалга үүсгэн төлбөр төлөх хэсгээс хэтэвч доторх мөнгөө ашиглан төлбөрөө төлөх гэсэн сонголтыг сонгон төлөх боломжтой.",
	},
	{
		q: "Захиалгын явцаа хэрхэн харах вэ?",
		a: "Аппликейшны захиалга цэсээс өөрийн захиалгын төлөвийг хянах боломжтой.",
	},
	{
		q: "Бэлгийн карт хэрхэн ашиглах вэ?",
		a: "Профайл цэс рүү орон бэлгийн карт ашиглах цонхонд тусгай дугаарыг оруулан ашиглах боломжтой.",
	},
	{
		q: "Захиалгын зөрүү төлбөрөө хэрхэн төлөх вэ?",
		a: "Төлбөрийн зөрүү үүссэн тохиолдолд захиалга цэс рүү орох үед зөрүү төлбөр төлөх хэсэг харагдана.",
	},
	{
		q: "Нэхэмжлэлээр хэрхэн төлөх вэ?",
		a: "Та захиалга үүсгэн төлбөр төлөх хэсэгт нэхэмжлэлээр төлөх сонголтыг сонгосноор нэхэмжлэл үүснэ.",
	},
	{
		q: "И-баримтаа хэрхэн авах вэ?",
		a: "Захиалга бүрийн дараа и-баримт авах боломжтой бөгөөд профайл цэсээс эсвэл захиалгын дэлгэрэнгүйгээс татаж авах боломжтой.",
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
				<button className="px-4 py-2 rounded font-semibold border bg-blue-600 text-white border-blue-600"
                        onClick={() => router.push("/company/support/faq")}>
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