namespace EvoEdge_Dashboard.db.Scheme;

entity MachineData {
  key id: UUID;
  name: String(256);
  numericId: String(256);
  value: String(256);
  timestamp: String(256);
  quantity: String(256);
}

entity WaxingMachine  {
  key id: UUID;
  machine_id: String;
  machine_name: String(100);
  Location: String(500);
  pressure: Decimal;
  created_date: Date;
  created_time: Time;
}

entity MachineType  {
  key Machine_Type: String;
  key Machine_Id: String;
  Value: Int16;
  Machine_Type_Name: String;
}

