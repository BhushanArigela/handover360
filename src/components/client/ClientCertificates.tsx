import React, { useEffect, useState } from "react";
import { Download, Eye, Search, QrCode, Shield, Building2, Star, User,} from "lucide-react";

import { DashboardLayout } from "../layout/DashboardLayout";
import { Modal } from "../ui/Modal";
import CertificateTemplate from "../certificates/CertificateTemplate";
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
  const [downloadCertificateData, setDownloadCertificateData] = useState<Certificate | null>(null);

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
  const downloadCertificateFromList = async (
      certificate: Certificate
    ) => {

      setDownloadCertificateData(certificate);

      // Wait for React to render the hidden certificate
      await new Promise(resolve => setTimeout(resolve, 200));

      await downloadCertificate(certificate);

      setDownloadCertificateData(null);

    };
    // const downloadCertificateFromServer = async (
    //       certificate: Certificate
    //   ) => {
    //       try {

    //           const token = localStorage.getItem("token");

    //           const response = await fetch(
    //               getPdfUrl(certificate.certificate_id),
    //               {
    //                   headers: {
    //                       Authorization: `Token ${token}`,
    //                   },
    //               }
    //           );

    //           if (!response.ok) {
    //               throw new Error("Unable to download certificate.");
    //           }

    //           const blob = await response.blob();

    //           const url = window.URL.createObjectURL(blob);

    //           const a = document.createElement("a");

    //           a.href = url;

    //           a.download = `Certificate-${certificate.certificate_id}.pdf`;

    //           document.body.appendChild(a);

    //           a.click();

    //           a.remove();

    //           window.URL.revokeObjectURL(url);

    //       } catch (err) {
    //           console.error(err);
    //       }
    //   };

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
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">

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
                  Technical Auditor
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
                  className="border-t border-gray-200 text-xs hover:bg-gray-50"
                >

                  <td className="p-4">

                    <div className="font-semibold text-sm">

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
    <div className="bg-gray-100 rounded-xl">

        <CertificateTemplate
            certificate={selected}
        />

        <div className="flex bg-gray-100 p-4 gap-3">

            <button
                onClick={() => downloadCertificate(selected)}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-purple-600 text-white"
            >
                <Download size={18}/>
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