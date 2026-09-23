"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAvailableAmbulances() {
  return await prisma.ambulance.findMany({
    where: { status: "AVAILABLE" },
  });
}

export async function getHospitals() {
  return await prisma.hospital.findMany();
}

export async function getUsersByRole(role: string) {
  return await prisma.user.findMany({ where: { role } });
}

export async function submitEmergencyRequest(data: {
  patientName: string;
  patientAge: number;
  emergencyType: string;
  description: string;
  condition: string;
  lat: number;
  lng: number;
}) {
  return await prisma.emergencyRequest.create({
    data: {
      ...data,
      status: "REQUESTED",
    },
  });
}

// DRIVER ACTIONS
export async function getDriverAmbulance(driverId: string) {
  return await prisma.ambulance.findUnique({
    where: { driverId },
    include: { requests: { where: { status: { not: "COMPLETED" } } } }
  });
}

export async function updateAmbulanceStatus(id: string, status: string) {
  return await prisma.ambulance.update({
    where: { id },
    data: { status }
  });
}

export async function updateRequestStatus(id: string, status: string, ambulanceId?: string) {
  const data: any = { status };
  if (ambulanceId) data.ambulanceId = ambulanceId;
  return await prisma.emergencyRequest.update({
    where: { id },
    data
  });
}

export async function getPendingRequests() {
  return await prisma.emergencyRequest.findMany({
    where: { status: "REQUESTED" }
  });
}

// DISPATCHER ACTIONS
export async function getAllAmbulances() {
  return await prisma.ambulance.findMany({
    include: { driver: true }
  });
}

export async function getAllEmergencies() {
  return await prisma.emergencyRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { ambulance: true, hospital: true }
  });
}
