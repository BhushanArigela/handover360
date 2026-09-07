import React, { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  Download,
  Eye,
  MapPin,
  Search,
  Shield,
  Star,
  User,
} from "lucide-react";

import { DashboardLayout } from "../layout/DashboardLayout";
import { Modal } from "../ui/Modal";

import { apiFetch } from "../../services/api";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

interface Engineer {
  id: string;
  name: string;
  username: string;
}

interface Certificate {
  certificate_id: string;
  enquiry_id: string;

  propertyAddress: string;
  clientName: string;

  engineer: Engineer | null;

  rating: number;
  grade: string;

  findings: string;
  recommendations: string;

  valid_until: string;
  issued_at: string;
}

export const ClientCertificates: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [search, setSearch] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [selected, setSelected] = useState<Certificate | null>(null);
  

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);

      const data = await apiFetch("/certificates/mycertificates/");
      
      setCertificates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = certificates.filter((c) =>
    c.propertyAddress.toLowerCase().includes(search.toLowerCase())
  );

  const gradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-700";

      case "B+":
      case "B":
        return "bg-blue-100 text-blue-700";

      case "C":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };
  
  const getPdfUrl = (certificateId: string) =>
  `${import.meta.env.VITE_API_URL}/certificates/${certificateId}/download/`;


const loadCertificatePdf = async (certificate: Certificate) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            getPdfUrl(certificate.certificate_id),
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load PDF");
        }

        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        setPdfBlobUrl(url);

        setSelected(certificate);

    } catch (err) {
        console.error(err);
    }
};
  const downloadCertificate = async () => {

    const certificate = document.getElementById("certificate");

    if (!certificate) return;

    const canvas = await html2canvas(certificate, {

        scale: 3,

        useCORS: true,

        backgroundColor: "#ffffff",

        scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4",
    });

    const pageWidth = 210;

    const pageHeight = 297;

    const imgWidth = pageWidth;

    const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    if (imgHeight <= pageHeight) {

        pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            imgWidth,
            imgHeight
        );

    } else {

        let heightLeft = imgHeight;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight
        );

        heightLeft -= pageHeight;

        while (heightLeft > 0) {

            position = heightLeft - imgHeight;

            pdf.addPage();

            pdf.addImage(
                imgData,
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );

            heightLeft -= pageHeight;
        }
    }

    pdf.save(
        `Certificate-${selected?.certificate_id}.pdf`
    );
};

  const printCertificate = () => {
  const iframe = document.getElementById(
    "certificateFrame"
  ) as HTMLIFrameElement;

  if (iframe?.contentWindow) {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }
};
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  return (
    <DashboardLayout>

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold">
            My Certificates
          </h1>

          <p className="text-gray-500">
            View all issued property certificates
          </p>
        </div>

      </div>

      <div className="bg-white rounded-xl p-4 mb-5">

        <div className="relative">

          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />

          <input
            className="w-full pl-10 pr-4 py-2.5 border bg-white border-gray-200 rounded-xl text-sm"
            placeholder="Search Property"

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>

      {loading ? (
        <div className="text-center py-10">

          Loading...

        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-16 text-center">

          <Shield
            size={60}
            className="mx-auto text-gray-300 mb-4"
          />

          <h3 className="text-lg font-semibold">

            No Certificates Found

          </h3>

          <p className="text-gray-500 mt-2">

            Once your inspection is approved,
            certificates will appear here.

          </p>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr className="text-left text-sm">

                <th className="p-4">
                  Property
                </th>

                <th>
                  Tecnical Auditor
                </th>

                <th>
                  Rating
                </th>

                <th>
                  Grade
                </th>

                <th>
                  Issued
                </th>

                <th>
                  Valid Till
                </th>

                <th className="text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((cert) => (

                <tr
                  key={cert.certificate_id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-4">

                    <div className="font-semibold">

                      {cert.propertyAddress}

                    </div>

                    <div className="text-xs text-gray-500">

                      {cert.clientName}

                    </div>

                  </td>

                  <td>

                    {cert.engineer?.name}

                  </td>

                  <td>

                    ⭐ {cert.rating}

                  </td>

                  <td>

                    <span
                      className={`px-3 py-1 rounded-full font-semibold ${gradeColor(
                        cert.grade
                      )}`}
                    >
                      {cert.grade}
                    </span>

                  </td>

                  <td>

                    {formatDate(cert.issued_at)}

                  </td>

                  <td>

                    {formatDate(cert.valid_until)}

                  </td>

                  <td>

                    <div className="flex justify-center gap-3">

                      <button onClick={() => loadCertificatePdf(cert)}>
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>

                      <button onClick={() => downloadCertificate()}>
                        <Download size={18} className="text-green-600" />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

      <Modal
        isOpen={selected != null}
        onClose={() => setSelected(null)}
        title="Certificate Details"
        size="xl"
      >
      {/* <div className="border rounded-xl overflow-hidden h-[700px]">
    <iframe
    id="certificateFrame" title="Certificate PDF"
    src={pdfBlobUrl}
    className="w-full h-[700px]"
/>
</div> */}
        {selected && (
<div className="bg-gray-100 p-6 rounded-xl">

    <div id="certificate" className="bg-white text-black"
  style={{
    backgroundColor: "#ffffff",
    color: "#111827",
  }}>

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-10 py-8">

            <div className="flex justify-between">

                <div>

                    <div className="text-xl font-extrabold tracking-wide">
                        HAVENSURE
                    </div>

                    <div className="text-blue-100 mt-2">
                        PROPERTY QUALITY CERTIFICATE
                    </div>

                </div>

                <div className="text-right">

                    <div className="text-sm uppercase text-blue-200">
                        Certificate No
                    </div>

                    <div className="font-mono mt-1 text-lg">
                        {selected.certificate_id}
                    </div>

                    <div className="mt-5 text-sm">
                        Issued
                    </div>

                    <div className="font-semibold">
                        {formatDate(selected.issued_at)}
                    </div>

                </div>

            </div>

        </div>

        {/* Body */}

        <div className="p-5">

            {/* Certificate Statement */}

            <div className="text-center">

                <h3 className="text-xl font-bold text-slate-800">
                    Property Inspection Certificate
                </h3>

                <p className="mt-2 text-gray-600 leading-8 max-w-xl mx-auto">
                    This certifies that the property mentioned below has been
                    professionally inspected by HavEnsure in accordance with
                    the applicable quality assessment standards.
                </p>

            </div>

            {/* Grade */}

            <div className="flex justify-center mt-1">

                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-xl flex flex-col justify-center items-center border-8 border-yellow-200">

                    <div className="text-6xl font-black text-white">
                        {selected.grade}
                    </div>

                    <div className="text-white font-semibold mt-2">
                        Grade
                    </div>

                </div>

            </div>

            {/* Rating */}

            <div className="mt-2 flex justify-center">

                <div className="flex items-center gap-2 text-yellow-500">

                    <Star fill="currentColor"/>

                    <span className="text-3xl font-bold text-gray-800">
                        {selected.rating}/5
                    </span>

                </div>

            </div>

            {/* Property Details */}

            <div className="mt-5 border rounded-xl overflow-hidden">

                <div className="bg-slate-100 px-6 py-4 font-bold text-lg">

                    Property Information

                </div>

                <div className="grid grid-cols-2 gap-6 p-6">

                    <div>

                        <div className="text-gray-500 text-sm">
                            Property
                        </div>

                        <div className="font-semibold text-lg">
                            {selected.propertyAddress}
                        </div>

                    </div>

                    <div>

                        <div className="text-gray-500 text-sm">
                            Client
                        </div>

                        <div className="font-semibold text-lg">
                            {selected.clientName}
                        </div>

                    </div>

                    <div>

                        <div className="text-gray-500 text-sm">
                            Tecnical Auditor
                        </div>

                        <div className="font-semibold text-lg">
                            {selected.engineer?.name}
                        </div>

                    </div>

                    <div>

                        <div className="text-gray-500 text-sm">
                            Valid Till
                        </div>

                        <div className="font-semibold text-lg">
                            {formatDate(selected.valid_until)}
                        </div>

                    </div>

                </div>

            </div>

            {/* Findings */}

            <div className="mt-3 border-l-8 border-green-600 bg-green-50 rounded-xl p-6">

                <h3 className="font-bold text-xl text-green-800 mb-3">

                    Inspection Findings

                </h3>

                <p className="leading-8 whitespace-pre-wrap text-gray-700">

                    {selected.findings}

                </p>

            </div>

            {/* Recommendations */}

            <div className="mt-3 border-l-8 border-amber-500 bg-amber-50 rounded-xl p-6">

                <h3 className="font-bold text-xl text-amber-800 mb-3">

                    Recommendations

                </h3>

                <p className="leading-8 whitespace-pre-wrap text-gray-700">

                    {selected.recommendations ||
                        "No recommendations provided."}

                </p>

            </div>

            {/* Footer */}

            <div className="mt-1 grid grid-cols-3 gap-8">

                <div className="border rounded-xl p-6 text-center">

                    <User
                        className="mx-auto mb-3 text-blue-600"
                        size={40}
                    />

                    <div className="text-gray-500 text-sm">
                        Certified By
                    </div>

                    <div className="font-bold text-lg mt-2">

                        {selected.engineer?.name}

                    </div>

                    <div className="text-sm text-gray-500">

                        Review Tecnical Auditor

                    </div>

                </div>

                <div className="border rounded-xl p-6 text-center">

                    <Shield
                        className="mx-auto mb-3 text-green-600"
                        size={40}
                    />

                    <div className="text-gray-500 text-sm">

                        Certificate Status

                    </div>

                    <div className="text-green-600 font-bold mt-2">

                        VERIFIED

                    </div>

                </div>

                <div className="border rounded-xl p-6 text-center">

                    <div className="w-28 h-28 mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">

                        QR CODE

                    </div>

                    <div className="text-sm text-gray-500 mt-3">

                        Scan to Verify

                    </div>

                </div>

            </div>

            {/* Disclaimer */}

            <div className="mt-1 text-center text-sm text-gray-500 leading-7">

                This certificate is electronically generated by
                <strong> HavEnsure Property Inspection Services</strong>.
                Any alteration or unauthorized modification invalidates this
                certificate.

            </div>

        </div>

    </div>

    {/* Buttons */}

    <div className="flex justify-end gap-3 mt-6">

        {/* <button
            onClick={printCertificate}
            className="px-6 py-3 rounded-xl border font-semibold hover:bg-gray-100"
        >
            Print
        </button> */}

        <button
            onClick={() => selected && downloadCertificate()}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
            Download PDF
        </button>

    </div>

</div>
)}

      </Modal>

    </DashboardLayout>
  );
};