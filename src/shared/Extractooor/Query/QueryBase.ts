import { GridColDef, GridRowsProp } from "@mui/x-data-grid-pro";
import { ExtractooorQuery } from "../Extractooor.type";

export abstract class ExtractooorQueryBase implements ExtractooorQuery {
  constructor(
    readonly title: string,
    readonly description: string
  ) {}


  abstract fetch(): Promise<{ rows: GridRowsProp; columns: GridColDef[] }>;
}
