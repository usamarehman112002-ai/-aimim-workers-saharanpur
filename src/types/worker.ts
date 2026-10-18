export type CommitteeSection =
  | 'district_core'      // जिला कोर कमेटी
  | 'district_committee' // जिला कमेटी
  | 'assembly_core'      // विधानसभा कोर कमेटी
  | 'assembly_committee' // विधानसभा कमेटी
  | 'block_committee'    // ब्लॉक कमेटी
  | 'village_committee'  // ग्राम कमेटी
  | 'all_workers';       // कार्यकर्ता सूची

export interface WorkerRecord {
  id: string;
  name: string; // नाम
  fatherName?: string; // पिता का नाम
  mobile: string; // मोबाइल नंबर (10 अंक)
  altMobile?: string; // वैकल्पिक मोबाइल नंबर
  assembly: string; // विधानसभा (e.g. '01 - बेहट')
  block: string; // ब्लॉक (e.g. 'मुजफ्फराबाद')
  villageOrWard: string; // ग्राम / वार्ड / मोहल्ला
  section: CommitteeSection; // कमेटी वर्ग
  role: string; // पद / दायित्व (e.g. 'जिला अध्यक्ष')
  notes?: string; // विशेष टिप्पणी / दायित्व
  joiningYear?: string; // पार्टी से जुड़ने का वर्ष
  bloodGroup?: string; // रक्त समूह (वैकल्पिक)
  address?: string; // पूरा पता
  isActive: boolean; // सक्रिय स्थिति
  isDemo?: boolean; // डेमो डेटा पहचान
  createdAt: number;
  updatedAt?: number;
}

export interface AssemblyConstituency {
  code: string;
  number: number;
  nameHi: string;
  nameEn: string;
  isReserved?: boolean;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  databaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}
