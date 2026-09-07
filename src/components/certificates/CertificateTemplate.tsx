import React from "react";
import {
    Building2,
    QrCode,
    Shield,
    Star,
    User,
} from "lucide-react";

interface Engineer {
    id?: string;
    name?: string;
    username?: string;
}

export interface Certificate {
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

interface Props {
    certificate: Certificate;
}

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

const CertificateTemplate: React.FC<Props> = ({
    certificate,
}) => {

    return (

<div
    id={`certificate_${certificate.certificate_id}`}
    className="bg-white shadow-2xl rounded-xl text-black"
    style={{
        backgroundColor: "#ffffff",
        color: "#111827",
    }}
>

    {/* Header */}

    <div className="bg-gradient-to-r from-green-900 via-green-900 to-slate-900 text-white px-5 py-5 rounded-b-none rounded-xl">

        <div className="flex justify-between">

            <div className="flex items-center gap-3">

                <div className="w-18 h-18 bg-green-50 rounded-xl flex items-center justify-center">

                    <Building2 className="w-12 h-12 text-green-600" />

                </div>

                <div>

                    <div className="text-xl">
                        HAVENSURE
                    </div>

                    <div className="text-blue-100 tracking-wide mt-2">
                        PROPERTY QUALITY CERTIFICATE
                    </div>

                </div>

            </div>

            <div className="text-right">

                <div className="text-sm uppercase text-blue-200">
                    Certificate No
                </div>

                <div className="font-mono mt-1 text-lg">
                    {certificate.certificate_id}
                </div>

                <div className="mt-5 text-sm">
                    Issued
                </div>

                <div className="font-semibold">
                    {formatDate(certificate.issued_at)}
                </div>

            </div>

        </div>

    </div>

    {/* Body */}

    <div className="p-5">

        <div className="flex items-center">

            <div className="flex-1">

                <h3 className="text-2xl font-bold text-slate-800">
                    Property Inspection Certificate
                </h3>

                <p className="mt-2 text-gray-600 leading-8">
                    This certifies that the property mentioned below has been professionally inspected by <b>HavEnsure</b> in accordance with the applicable quality assessment standards.
                </p>

            </div>

            <div>

                <div className="flex justify-center mt-1">

                    <div className="w-35 h-35 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-xl flex flex-col justify-center items-center border-8 border-yellow-200">

                        <div className="text-6xl font-black text-white">
                            {certificate.grade}
                        </div>

                        <div className="text-white font-semibold mt-2">
                            Grade
                        </div>

                    </div>

                </div>

                <div className="mt-2 bg-white shadow-xl rounded-xl border border-gray-100 p-2 flex justify-center">

                    <div className="flex items-center gap-2 text-yellow-500">

                        <Star fill="currentColor" />

                        <span className="text-3xl font-bold text-gray-800">
                            {certificate.rating}
                            <span className="text-lg">/5</span>
                        </span>

                    </div>

                </div>

            </div>

        </div>

        <div className="mt-5 bg-white border shadow-xl border-l-6 border-green-600 rounded-xl overflow-hidden">

            <div className="border-b flex items-center gap-3 border-gray-200 px-6 py-4 font-bold text-lg">

                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">

                    <Building2 className="w-7 h-7 text-green-600"/>

                </div>

                Property Information

            </div>

            <div className="grid grid-cols-2 gap-6 p-4">

                <div>

                    <div className="text-gray-500 text-sm">
                        Property
                    </div>

                    <div className="font-semibold text-lg">
                        {certificate.propertyAddress}
                    </div>

                </div>

                <div>

                    <div className="text-gray-500 text-sm">
                        Client
                    </div>

                    <div className="font-semibold text-lg">
                        {certificate.clientName}
                    </div>

                </div>

                <div>

                    <div className="text-gray-500 text-sm">
                        Technical Auditor
                    </div>

                    <div className="font-semibold text-lg">
                        {certificate.engineer?.name}
                    </div>

                </div>

                <div>

                    <div className="text-gray-500 text-sm">
                        Valid Till
                    </div>

                    <div className="font-semibold text-lg">
                        {formatDate(certificate.valid_until)}
                    </div>

                </div>

            </div>

        </div>

        <div className="mt-4 border border-blue-200 bg-blue-50 rounded-xl p-4">

            <h3 className="font-bold text-xl text-blue-800">
                Inspection Findings
            </h3>

            <p
                className="leading-8 whitespace-pre-wrap text-gray-700"
                dangerouslySetInnerHTML={{
                    __html: certificate.findings,
                }}
            />

        </div>

        <div className="mt-4 border border-orange-300 bg-orange-50 rounded-xl p-4">

            <h3 className="font-bold text-xl text-amber-800">
                Recommendations
            </h3>
            <p
                className="leading-8 whitespace-pre-wrap text-gray-700"
                dangerouslySetInnerHTML={{
                    __html: certificate.recommendations, 
                }}
            /> 

        </div>

        <div className="mt-4 grid grid-cols-3 gap-8">

            <div className="bg-purple-50 border-b-3 border-purple-500 rounded-xl p-4 text-center">

                <div className="mx-auto w-15 h-15 bg-purple-600 border-5 border-purple-100 rounded-full flex items-center justify-center mb-3">

                    <User className="text-white" size={30}/>

                </div>

                <div className="text-gray-700 text-sm">
                    Certified By
                </div>

                <div className="font-bold text-lg mt-2">
                    {certificate.engineer?.name}
                </div>

                <div className="text-sm text-gray-700">
                    Review Technical Auditor
                </div>

            </div>

            <div className="bg-green-50 border-b-3 border-green-500 rounded-xl p-4 text-center">

                <div className="mx-auto w-15 h-15 bg-green-600 border-5 border-green-100 rounded-full flex items-center justify-center mb-3">

                    <Shield className="text-white" size={30}/>

                </div>

                <div className="text-gray-700 text-sm">
                    Certificate Status
                </div>

                <div className="text-green-600 font-bold mt-2">
                    VERIFIED
                </div>

            </div>

            <div className="bg-blue-50 border-b-3 border-blue-500 rounded-xl p-4 text-center">

                <div className="mx-auto w-15 h-15 bg-blue-600 border-5 border-blue-100 rounded-full flex items-center justify-center mb-3">

                    <QrCode className="text-white" size={30}/>

                </div>

                <div className="text-gray-700 text-sm">
                    QR CODE
                </div>

                <div className="text-sm text-gray-700 mt-3">
                    Scan to Verify
                </div>

            </div>

        </div>

    </div>

    <div className="flex bg-gray-100 p-4 rounded-b-xl">

        <div className="text-sm text-gray-500 leading-7">

            This certificate is electronically generated by
            <strong> HavEnsure Property Inspection Services</strong>.
            Any alteration or unauthorized modification invalidates this certificate.

        </div>

    </div>

</div>

    );

};

export default CertificateTemplate;