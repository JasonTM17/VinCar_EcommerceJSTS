export type Dealer = {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  status: string;
};

export type TestDriveSlot = {
  id: string;
  dealerId: string;
  date: string;
  startTime: string;
  capacity: number;
  booked: number;
};

export type TestDriveBooking = {
  id: string;
  userId: string;
  dealerId: string;
  slotId: string;
  modelSlug: string;
  status: string;
  createdAt: string;
};
