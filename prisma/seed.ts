import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)
  
  // Clean up
  await prisma.emergencyRequest.deleteMany()
  await prisma.ambulance.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.user.deleteMany()

  // Create Users (Drivers & Dispatcher & Admin)
  const driver1 = await prisma.user.create({
    data: { name: 'John Driver', role: 'DRIVER' }
  })
  const driver2 = await prisma.user.create({
    data: { name: 'Sarah Paramedic', role: 'DRIVER' }
  })
  await prisma.user.create({
    data: { name: 'Admin User', role: 'ADMIN' }
  })

  // Create Hospitals
  const h1 = await prisma.hospital.create({
    data: {
      name: 'City General Hospital (DEMO)',
      lat: 40.7128,
      lng: -74.0060,
      emergencyServices: 'Emergency Department, ICU, Pharmacy',
      status: 'AVAILABLE',
      contactNumber: '555-0101'
    }
  })

  const h2 = await prisma.hospital.create({
    data: {
      name: 'County Trauma Center (DEMO)',
      lat: 40.7300,
      lng: -73.9900,
      emergencyServices: 'Trauma Care, Cardiology, ICU',
      status: 'AVAILABLE',
      contactNumber: '555-0102'
    }
  })

  // Create Ambulances
  await prisma.ambulance.create({
    data: {
      vehicleNumber: 'A-101',
      status: 'AVAILABLE',
      lat: 40.7200,
      lng: -73.9950,
      driverId: driver1.id
    }
  })

  await prisma.ambulance.create({
    data: {
      vehicleNumber: 'A-102',
      status: 'BUSY',
      lat: 40.7150,
      lng: -74.0100,
      driverId: driver2.id
    }
  })

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
