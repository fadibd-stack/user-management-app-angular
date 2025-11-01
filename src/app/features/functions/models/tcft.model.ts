export interface TCFTTriplet {
  fpid: number;
  fdid: string;
  fname: string;
  fstatus: string;
  adid: string;
  aname: string;
  astatus: string;
  pdid: string;
  pname: string;
  pstatus: string;
}

export interface TCFTProduct {
  id: number;
  name: string;
  code: string;
  status: string;
}

export interface TCFTDomain {
  id: number;
  name: string;
  code: string;
  status: string;
  product_id: number;
}
