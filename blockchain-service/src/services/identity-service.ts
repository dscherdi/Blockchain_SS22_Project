import {v4} from "uuid";

export class IdentityService {
  createCocoaBagIdentity() {
    return v4();
  }
}