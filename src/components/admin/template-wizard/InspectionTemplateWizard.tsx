import React, { useEffect, useState } from 'react'  
import { useApp } from "../../../context/AppContext";

import StepIndicator from './StepIndicator'
import Step1CreateTemplate from './Step1CreateTemplate'
import Step2AddFloors from './Step2AddFloors'
import Step3DragRooms from './Step3DragRooms'
import Step4ManageRoomsFloor from './Step4ManageRoomsFloor'
import Step5DragSections from './Step5DragSections'
import Step6ManageItems from './Step6ManageItems'
import Step8Preview from './Step8Preview'

import {getRoomLibrary, deleteTemplate, } from "../../../api/api";
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { confirm  } from "../../../utils/toast";

const InspectionTemplateWizard: React.FC = () => {
  const [view, setView] = useState('template-wizard')
  const [step, setStep] = useState(1)
  const [maxReached, setMaxReached] = useState(1)
  const { navigate, pageParams, } = useApp();
  const [template, setTemplate] = useState<any>( pageParams?.template ?? null );
  const [floors, setFloors] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [roomsByFloor, setRoomsByFloor] = useState<Record<number, any[]>>({});
  const [sectionsByRoom, setSectionsByRoom] = useState<Record<number, any[]>>({});
  const [itemsBySection, setItemsBySection] = useState<Record<number, any[]>>({});

  useEffect(() => {

    if (!pageParams?.editMode || !pageParams?.template)
        return;

    const data = pageParams.template;

    setTemplate(data);

    setFloors(data.floors || []);

    const roomMap: Record<number, any[]> = {};
    const sectionMap: Record<number, any[]> = {};
    const itemMap: Record<number, any[]> = {};

    (data.floors || []).forEach((floor: any) => {

        roomMap[floor.id] = floor.rooms || [];

        (floor.rooms || []).forEach((room: any) => {

            sectionMap[room.id] = room.sections || [];

            (room.sections || []).forEach((section: any) => {

                itemMap[section.id] = section.items || [];

            });

        });

    });

    setRoomsByFloor(roomMap);
    setSectionsByRoom(sectionMap);
    setItemsBySection(itemMap);

}, [pageParams]);

  function goTo(n: number) {
    setStep(n)
    setMaxReached((m) => Math.max(m, n))
  }

  function resetWizard() {
    setTemplate(null)
    setFloors([])
    setRoomsByFloor({})
    setSelectedRoomId(null)
    setSectionsByRoom({})
    setItemsBySection({})
    setStep(1)
    setMaxReached(1)
    setView('template-wizard')
  }

  const allRooms = floors.flatMap((floor) =>
    (roomsByFloor[floor.id] || []).map((room) => ({
        ...room,
        floorName: floor.name,
        floorCode: floor.code,
    }))
);
  const selectedRoom = (allRooms as any[]).find(
      (r) => r.id === selectedRoomId
  );
  const sectionsForSelectedRoom = selectedRoom ? (sectionsByRoom[selectedRoom.id] || []) : []
  
  function renderWizardStep() {
    switch (step) {
      case 1:
        return (
          <Step1CreateTemplate
              template={template}
              onCreated={(tmpl: any) => {
                  setTemplate(tmpl);
              }}
              onNext={() => goTo(2)}
              onCancel={async () => {

                const ok = await confirm(
                    "Cancel Template?",
                    "This will delete the draft template and all associated data."
                );

                if (!ok) return;
                if (template?.id) {
                  await deleteTemplate(template.id);
                }

                resetWizard();

            }}
        />
    );
      case 2:
        return (
          <Step2AddFloors
            template={template}
            floors={floors}
            setFloors={setFloors}
            onBack={() => goTo(1)}
            onNext={() => goTo(3)}
          />
        )
      case 3:
        return (
          <Step3DragRooms
            floors={floors}
            roomsByFloor={roomsByFloor}
            setRoomsByFloor={setRoomsByFloor}
            onBack={() => goTo(2)}
            onNext={() => goTo(4)}
          />
        )
      case 4:
        return (
          <Step4ManageRoomsFloor
            floors={floors}
            roomsByFloor={roomsByFloor}
            setRoomsByFloor={setRoomsByFloor}
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            onBack={() => goTo(3)}
            onNext={() => goTo(5)}
          />
        )
      case 5:
        if (!selectedRoom) return <div className="empty-note">Go back and select a room first.</div>
        return (
          <Step5DragSections
            // rooms={selectedRoom}
            rooms={allRooms}
            sectionsByRoom={sectionsByRoom}
            setSectionsByRoom={setSectionsByRoom}
            onBack={() => goTo(4)}
            onNext={() => goTo(6)}
          />
        )
      case 6:
        if (!selectedRoom) return <div className="empty-note">Go back and select a room first.</div>
        return (
          <Step6ManageItems
            // room={selectedRoom}
            rooms={allRooms}
            sections={sectionsForSelectedRoom}
            itemsBySection={itemsBySection}
            setItemsBySection={setItemsBySection}
            onBack={() => goTo(5)}
            onNext={() => goTo(8)}
          />
        )
      case 8:
        return (
          <Step8Preview
            template={template}
            onBack={() => goTo(6)}
            onPublish={() => {
              setView("admin-template-list");
              resetWizard();
          }}
          />
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
    <div className="flex h-full bg-gray-100">
      
      <div className="flex-1 overflow-auto p-6">
           {view === 'template-list' && (
          <div className="panel empty-note">
            Template list would be shown here. Use "Create Template" to start the wizard.
          </div>
        )}

        {view === "template-wizard" && (
          <>
            
            {/* <StepIndicator step={step} maxReached={maxReached} onJump={goTo} /> */}
            {renderWizardStep()}
          </>
        )}

      </div>
      
      
    </div>
    </DashboardLayout>
  )
}
export default InspectionTemplateWizard;