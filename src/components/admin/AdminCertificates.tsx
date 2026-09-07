import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { StarRating } from "../ui/StarRating";
import { Shield, Eye, Download } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { apiFetch } from "../../services/api";
import { error } from "../../utils/toast";
import { formatDate } from "../../utils/date";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { Modal } from "../ui/Modal";
import CertificateTemplate from "../certificates/CertificateTemplate";

type Certificate = {
    certificate_id: string;
    enquiry_id: string;

    propertyAddress: string;
    clientName: string;

    rating: number;
    grade: string;

    findings: string;
    recommendations: string;

    valid_until: string;
    issued_at: string;

    engineer: {
        name?: string;
        username: string;
    };
};

export const AdminCertificates: React.FC = () => {
  const { navigate } = useApp();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [downloadCertificateData, setDownloadCertificateData] =  useState<Certificate | null>(null);


  useEffect(() => {
    const loadCertificates = async () => {
      setLoading(true);

      try {
        await fetchCertificates();
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await apiFetch(
        "/certificates/certificatelist/",
        {},
        navigate
      );

      // const data = await res.json();
      setCertificates(res);
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to load certificates");
    }
  };

  const downloadCertificateFromList = async (
      certificate: Certificate
  ) => {

      setDownloadCertificateData(certificate);

      await new Promise(resolve =>
          setTimeout(resolve, 500)
      );

      await downloadCertificate(certificate);

      setDownloadCertificateData(null);

  };

  const gradeColors: Record<string, string> = {
    "A+": "text-green-600 bg-green-50",
    A: "text-green-600 bg-green-50",
    "B+": "text-blue-600 bg-blue-50",
    B: "text-blue-600 bg-blue-50",
    C: "text-orange-600 bg-orange-50",
    D: "text-red-600 bg-red-50",
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

  const downloadCertificate = async (certificate: Certificate) => {
        const element = document.getElementById(
          `certificate_${certificate.certificate_id}`
        );
        
        if (!element) return;
  
        const canvas = await html2canvas(element, {
  
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
            `Certificate-${certificate?.certificate_id}.pdf`
        );
    };
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-lg">
            Loading certificates...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          All Certificates
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          {certificates.length} certificates issued
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            No certificates issued yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Property</th>
                  <th className="text-left p-4">Client</th>
                  <th className="text-left p-4">Grade</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-left p-4">Technical Auditor</th>
                  <th className="text-left p-4">Issued</th>
                  <th className="text-left p-4">Valid Until</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {certificates.map((cert) => (
                  <tr
                    key={cert.certificate_id}
                    className="hover:bg-gray-50"
                  >
                    <td className="p-4 font-mono text-xs">
                      #{cert.certificate_id.slice(-4).toUpperCase()}
                    </td>

                    <td className="p-4">
                      {cert.propertyAddress}
                    </td>

                    <td className="p-4">
                      {cert.clientName}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full font-bold ${
                          gradeColors[cert.grade] ??
                          "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {cert.grade}
                      </span>
                    </td>

                    <td className="p-4">
                      <StarRating
                        rating={Number(cert.rating)}
                        size="sm"
                        showValue
                      />
                    </td>

                    <td className="p-4">
                      {cert.engineer.name ??
                        cert.engineer.username}
                    </td>

                    <td className="p-4">
                      {formatDate(cert.issued_at)}
                    </td>

                    <td className="p-4">
                      {formatDate(cert.valid_until)}
                    </td>

                    <td>

                      <div className="flex justify-center gap-3">

                        <button onClick={() => loadCertificatePdf(cert)}>
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>

                        <button onClick={() => downloadCertificateFromList(cert)}>
                          <Download size={18} className="text-green-600" />
                        </button>

                      </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal
        isOpen={selected != null}
        onClose={() => setSelected(null)}
        title="Certificate Details"
        size="xl"
    >
        {selected && (
            <div className="bg-gray-100 rounded-xl">

                <CertificateTemplate
                    certificate={selected}
                />

                <div className="flex bg-gray-100 p-4 gap-3">

                    <button
                        onClick={() => downloadCertificate(selected)}
                        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-purple-600 text-white"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>

                </div>

            </div>
        )}
    </Modal>
    {downloadCertificateData && (
    <div
        style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "794px",
            background: "#fff",
            zIndex: -1,
        }}
    >
        <CertificateTemplate
            certificate={downloadCertificateData}
        />
    </div>
)}
    </DashboardLayout>
  );
};