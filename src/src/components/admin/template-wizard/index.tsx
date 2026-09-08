import { DashboardLayout } from "../../layout/DashboardLayout";
import InspectionTemplateWizard from "./InspectionTemplateWizard";

export default function AdminTemplates() {
    return (
        <DashboardLayout>
            <InspectionTemplateWizard />
        </DashboardLayout>
    );
}