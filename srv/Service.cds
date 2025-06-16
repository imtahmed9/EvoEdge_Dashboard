using {EvoEdge_Dashboard.db.Scheme as machineData} from '../db/Scheme';

@path: 'my'
service MyService {

  entity WaxingMachineSet       as projection on machineData.WaxingMachine;

  entity WaxingMachineAnalytics as
    select from machineData.WaxingMachine {
      key id,
          machine_id,
          machine_name,
          created_date,
          created_time,
          @Aggregation.default: #SUM
          pressure
    };

  entity MachineTypeSet         as projection on machineData.MachineType;

  entity UniqueMachineTypes     as
    select from machineData.MachineType {
      key Machine_Type
    }
    group by
      Machine_Type;


}
