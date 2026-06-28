-- =========================Sample Seed Data - PostgreSQL =====================================================

-- ─────────── TABLE DEFINITIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id VARCHAR(50) PRIMARY KEY,
    doctor_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    hospital VARCHAR(200) NOT NULL,
    subscription_type VARCHAR(20) NOT NULL CHECK (subscription_type IN ('free', 'premium')),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    age SMALLINT NOT NULL CHECK (age BETWEEN 1 AND 120),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    created_by VARCHAR(20) NOT NULL CHECK (created_by IN ('admin', 'doctor')),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_doctors (
    relation_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(doctor_id),
    UNIQUE (patient_id, doctor_id)
);

CREATE TABLE IF NOT EXISTS documents (
    document_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    doctor_id VARCHAR(50) REFERENCES doctors(doctor_id),
    type VARCHAR(30) NOT NULL CHECK (
        type IN (
            'Prescription',
            'Blood Report',
            'X-Ray',
            'MRI',
            'CT Scan',
            'ECG',
            'Ultrasound',
            'Other'
        )
    ),
    title VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by VARCHAR(20) NOT NULL CHECK (uploaded_by IN ('patient', 'doctor', 'admin')),
    upload_date TIMESTAMPTZ NOT NULL,
    notes TEXT
);

-- ======================== MASTERS TABLE =========================================== --
CREATE TABLE IF NOT EXISTS medicine_master (
    medicine_id SERIAL PRIMARY KEY,
    medicine_name VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS history_master (
    history_id SERIAL PRIMARY KEY,
    history_name VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS illness_master (
    illness_id SERIAL PRIMARY KEY,
    illness_name VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS symptom_master (
    symptom_id SERIAL PRIMARY KEY,
    symptom_name VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS advice_master (
    advice_id SERIAL PRIMARY KEY,
    advice_text VARCHAR(255) UNIQUE NOT NULL
);


-- ======================== PRESCRIPTIONS ====================================== --
CREATE TABLE prescriptions (
    prescription_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    doctor_id VARCHAR(50) REFERENCES doctors(doctor_id),
    advice TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prescription_items (
    item_id SERIAL PRIMARY KEY,
    prescription_id VARCHAR(50) REFERENCES prescriptions(prescription_id),
    medicine_name VARCHAR(200),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'patient', 'admin')),
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'premium', 'enterprise', 'trial')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL
);

-- ──────────── DOCTORS  (6 records) ────────────────────────────────
INSERT INTO doctors VALUES
  ('d1000001-0000-0000-0000-000000000001', 'Dr. Ramesh Kulkarni',    '+919876543210', 'ramesh.kulkarni@apollohospitals.com',    'Cardiology',          'Apollo Hospitals, Mumbai',              'premium', '2023-03-12 09:15:00+05:30'),
  ('d1000001-0000-0000-0000-000000000002', 'Dr. Priya Nambiar',      '+919876543211', 'priya.nambiar@fortishealthcare.com',     'Neurology',           'Fortis Healthcare, Bengaluru',          'premium', '2023-05-22 10:30:00+05:30'),
  ('d1000001-0000-0000-0000-000000000003', 'Dr. Arvind Mehta',       '+919876543212', 'arvind.mehta@aiims.edu',                'Orthopedics',         'AIIMS, New Delhi',                      'free',    '2023-07-04 08:00:00+05:30'),
  ('d1000001-0000-0000-0000-000000000004', 'Dr. Sunita Agarwal',     '+919876543213', 'sunita.agarwal@manipalhospitals.com',   'Gynaecology',         'Manipal Hospitals, Bengaluru',          'premium', '2023-09-18 11:00:00+05:30'),
  ('d1000001-0000-0000-0000-000000000005', 'Dr. Karthik Rajan',      '+919876543214', 'karthik.rajan@kmchospital.com',         'Pulmonology',         'KMC Hospital, Mangalore',               'free',    '2024-01-07 09:45:00+05:30'),
  ('d1000001-0000-0000-0000-000000000006', 'Dr. Meena Iyer',         '+919876543215', 'meena.iyer@narayanahealth.com',         'Endocrinology',       'Narayana Health, Kolkata',              'premium', '2024-02-14 14:20:00+05:30');

-- ───────────── PATIENTS  (15 records) ─────────────────────────────────
INSERT INTO patients VALUES
  ('p2000001-0000-0000-0000-000000000001', 'Amit Sharma',        '+919123456701', 34, 'Male',   'admin',  '2023-04-01 10:00:00+05:30'),
  ('p2000001-0000-0000-0000-000000000002', 'Deepika Reddy',      '+919123456702', 28, 'Female', 'doctor', '2023-04-15 11:30:00+05:30'),
  ('p2000001-0000-0000-0000-000000000003', 'Suresh Pillai',      '+919123456703', 52, 'Male',   'doctor', '2023-05-10 09:00:00+05:30'),
  ('p2000001-0000-0000-0000-000000000004', 'Nisha Gupta',        '+919123456704', 41, 'Female', 'admin',  '2023-06-20 14:00:00+05:30'),
  ('p2000001-0000-0000-0000-000000000005', 'Rajesh Yadav',       '+919123456705', 63, 'Male',   'doctor', '2023-07-08 08:30:00+05:30'),
  ('p2000001-0000-0000-0000-000000000006', 'Ananya Bose',        '+919123456706', 22, 'Female', 'admin',  '2023-08-25 13:15:00+05:30'),
  ('p2000001-0000-0000-0000-000000000007', 'Mohammed Siddiqui',  '+919123456707', 47, 'Male',   'doctor', '2023-09-02 10:45:00+05:30'),
  ('p2000001-0000-0000-0000-000000000008', 'Kavya Menon',        '+919123456708', 31, 'Female', 'admin',  '2023-10-14 16:00:00+05:30'),
  ('p2000001-0000-0000-0000-000000000009', 'Harish Chandra',     '+919123456709', 58, 'Male',   'doctor', '2023-11-05 09:20:00+05:30'),
  ('p2000001-0000-0000-0000-000000000010', 'Pooja Joshi',        '+919123456710', 36, 'Female', 'admin',  '2023-12-01 11:00:00+05:30'),
  ('p2000001-0000-0000-0000-000000000011', 'Vikram Singh',       '+919123456711', 45, 'Male',   'doctor', '2024-01-18 08:00:00+05:30'),
  ('p2000001-0000-0000-0000-000000000012', 'Rekha Nair',         '+919123456712', 55, 'Female', 'admin',  '2024-02-09 10:30:00+05:30'),
  ('p2000001-0000-0000-0000-000000000013', 'Sanjay Patel',       '+919123456713', 39, 'Male',   'doctor', '2024-03-22 12:00:00+05:30'),
  ('p2000001-0000-0000-0000-000000000014', 'Lalita Verma',       '+919123456714', 67, 'Female', 'admin',  '2024-04-11 15:30:00+05:30'),
  ('p2000001-0000-0000-0000-000000000015', 'Arjun Kapoor',       '+919123456715', 19, 'Male',   'doctor', '2024-05-03 09:00:00+05:30');

-- ─────────────────────────────────────────────
-- PATIENT_DOCTORS  (30 records, many-to-many)
-- Edge cases: some patients have 3 doctors; Dr. Karthik has no patients
-- ─────────────────────────────────────────────
INSERT INTO patient_doctors VALUES
  -- Amit sees Cardiologist + Neurologist + Endocrinologist (3 doctors)
  ('r3000001-0000-0000-0000-000000000001', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000001'),
  ('r3000001-0000-0000-0000-000000000002', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000002'),
  ('r3000001-0000-0000-0000-000000000003', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000006'),
  -- Deepika sees Gynaecologist + Endocrinologist (2 doctors)
  ('r3000001-0000-0000-0000-000000000004', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000004'),
  ('r3000001-0000-0000-0000-000000000005', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000006'),
  -- Suresh sees Cardiologist + Orthopedics (2 doctors)
  ('r3000001-0000-0000-0000-000000000006', 'p2000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000001'),
  ('r3000001-0000-0000-0000-000000000007', 'p2000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000003'),
  -- Nisha sees Neurologist only (1 doctor)
  ('r3000001-0000-0000-0000-000000000008', 'p2000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000002'),
  -- Rajesh sees Cardiologist + Endocrinologist (2 doctors — elderly with comorbidities)
  ('r3000001-0000-0000-0000-000000000009', 'p2000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000001'),
  ('r3000001-0000-0000-0000-000000000010', 'p2000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000006'),
  -- Ananya sees Gynaecologist only
  ('r3000001-0000-0000-0000-000000000011', 'p2000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000004'),
  -- Mohammed sees Cardiologist + Orthopedics + Neurologist (3 doctors)
  ('r3000001-0000-0000-0000-000000000012', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000001'),
  ('r3000001-0000-0000-0000-000000000013', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000003'),
  ('r3000001-0000-0000-0000-000000000014', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000002'),
  -- Kavya sees Gynaecologist + Endocrinologist (PCOD)
  ('r3000001-0000-0000-0000-000000000015', 'p2000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000004'),
  ('r3000001-0000-0000-0000-000000000016', 'p2000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000006'),
  -- Harish sees Cardiologist + Orthopedics (2 doctors)
  ('r3000001-0000-0000-0000-000000000017', 'p2000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000001'),
  ('r3000001-0000-0000-0000-000000000018', 'p2000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000003'),
  -- Pooja sees Endocrinologist (thyroid)
  ('r3000001-0000-0000-0000-000000000019', 'p2000001-0000-0000-0000-000000000010', 'd1000001-0000-0000-0000-000000000006'),
  -- Vikram sees Orthopedics + Neurologist (spine issue)
  ('r3000001-0000-0000-0000-000000000020', 'p2000001-0000-0000-0000-000000000011', 'd1000001-0000-0000-0000-000000000003'),
  ('r3000001-0000-0000-0000-000000000021', 'p2000001-0000-0000-0000-000000000011', 'd1000001-0000-0000-0000-000000000002'),
  -- Rekha sees Gynaecologist + Endocrinologist + Cardiologist (3 doctors — menopause + diabetes + BP)
  ('r3000001-0000-0000-0000-000000000022', 'p2000001-0000-0000-0000-000000000012', 'd1000001-0000-0000-0000-000000000004'),
  ('r3000001-0000-0000-0000-000000000023', 'p2000001-0000-0000-0000-000000000012', 'd1000001-0000-0000-0000-000000000006'),
  ('r3000001-0000-0000-0000-000000000024', 'p2000001-0000-0000-0000-000000000012', 'd1000001-0000-0000-0000-000000000001'),
  -- Sanjay sees Cardiologist only
  ('r3000001-0000-0000-0000-000000000025', 'p2000001-0000-0000-0000-000000000013', 'd1000001-0000-0000-0000-000000000001'),
  -- Lalita sees Orthopedics + Endocrinologist + Neurologist (3 doctors — elderly)
  ('r3000001-0000-0000-0000-000000000026', 'p2000001-0000-0000-0000-000000000014', 'd1000001-0000-0000-0000-000000000003'),
  ('r3000001-0000-0000-0000-000000000027', 'p2000001-0000-0000-0000-000000000014', 'd1000001-0000-0000-0000-000000000006'),
  ('r3000001-0000-0000-0000-000000000028', 'p2000001-0000-0000-0000-000000000014', 'd1000001-0000-0000-0000-000000000002'),
  -- Arjun sees Orthopedics (sports injury)
  ('r3000001-0000-0000-0000-000000000029', 'p2000001-0000-0000-0000-000000000015', 'd1000001-0000-0000-0000-000000000003'),
  -- Extra: Deepika also sees Neurologist (migraine)
  ('r3000001-0000-0000-0000-000000000030', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000002');
  -- NOTE: Dr. Karthik Rajan (doctor 5) intentionally has no patients (edge case)

-- ─────────────────────────────────────────────
-- DOCUMENTS  (50 records)
-- Edge cases: same-day uploads, patient-uploaded vs doctor-uploaded,
--             patients with no docs (patient 13 Sanjay, patient 15 Arjun)
-- ─────────────────────────────────────────────
INSERT INTO documents VALUES
  -- Amit (p01) — Cardiology + Neurology docs
  ('doc00001-0000-0000-0000-000000000001', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000001', 'ECG',         'Resting 12-Lead ECG — April 2023',          'https://storage.meddocs.in/amit/ecg_april2023.pdf',         'patient', '2023-04-10 10:30:00+05:30', 'Baseline ECG before cardiac evaluation'),
  ('doc00001-0000-0000-0000-000000000002', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000001', 'Prescription', 'Cardiologist Rx — Amlodipine 5mg',          'https://storage.meddocs.in/amit/rx_cardio_apr2023.pdf',     'doctor',  '2023-04-10 11:00:00+05:30', 'Amlodipine 5mg OD, Aspirin 75mg OD — 30 days'),  -- same day upload
  ('doc00001-0000-0000-0000-000000000003', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000002', 'MRI',          'Brain MRI — Headache Workup June 2023',     'https://storage.meddocs.in/amit/brain_mri_jun2023.pdf',     'doctor',  '2023-06-15 09:00:00+05:30', 'No space-occupying lesion; mild white matter changes'),
  ('doc00001-0000-0000-0000-000000000004', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000001', 'Blood Report', 'Lipid Profile — August 2023',               'https://storage.meddocs.in/amit/lipid_aug2023.pdf',         'patient', '2023-08-20 08:00:00+05:30', 'LDL 142 mg/dL — elevated, statin advised'),
  ('doc00001-0000-0000-0000-000000000005', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'HbA1c + Thyroid Panel — Nov 2023',          'https://storage.meddocs.in/amit/hba1c_nov2023.pdf',         'patient', '2023-11-02 07:45:00+05:30', 'HbA1c 6.1%, TSH normal'),

  -- Deepika (p02) — Gynaecology + Neurology + Endocrinology
  ('doc00001-0000-0000-0000-000000000006', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000004', 'Ultrasound',  'Pelvic USG — Follicle Study May 2023',      'https://storage.meddocs.in/deepika/usg_pelvis_may2023.pdf', 'doctor',  '2023-05-05 10:00:00+05:30', 'PCOD pattern — multiple follicles bilateral ovaries'),
  ('doc00001-0000-0000-0000-000000000007', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000004', 'Prescription', 'Gynaec Rx — OCP + Metformin',               'https://storage.meddocs.in/deepika/rx_gynae_may2023.pdf',   'doctor',  '2023-05-05 10:30:00+05:30', 'Yasmin OCP + Metformin 500mg BD — 3 months'),  -- same day
  ('doc00001-0000-0000-0000-000000000008', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000002', 'MRI',          'MRI Brain — Migraine Protocol Aug 2023',    'https://storage.meddocs.in/deepika/mri_brain_aug2023.pdf',  'doctor',  '2023-08-12 09:30:00+05:30', 'Normal MRI; clinical migraine without aura'),
  ('doc00001-0000-0000-0000-000000000009', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'Fasting Insulin + HOMA-IR — Oct 2023',      'https://storage.meddocs.in/deepika/insulin_oct2023.pdf',    'patient', '2023-10-18 07:30:00+05:30', 'Insulin resistance confirmed; diet counselling done'),
  ('doc00001-0000-0000-0000-000000000010', 'p2000001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000004', 'Prescription', 'Gynaec Follow-up Rx — March 2024',          'https://storage.meddocs.in/deepika/rx_gynae_mar2024.pdf',   'doctor',  '2024-03-07 11:00:00+05:30', 'Continued Metformin; OCP discontinued — cycle regularised'),

  -- Suresh (p03) — Cardiology + Orthopedics (elderly, multiple conditions)
  ('doc00001-0000-0000-0000-000000000011', 'p2000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000001', 'ECG',          'Post-Angioplasty ECG — May 2023',           'https://storage.meddocs.in/suresh/ecg_post_angio_may23.pdf','doctor',  '2023-05-15 08:00:00+05:30', 'Stable sinus rhythm post LAD stenting'),
  ('doc00001-0000-0000-0000-000000000012', 'p2000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000003', 'X-Ray',        'Knee X-Ray Bilateral — June 2023',          'https://storage.meddocs.in/suresh/knee_xray_jun2023.pdf',   'patient', '2023-06-28 09:15:00+05:30', 'Grade III OA bilateral knees — replacement advised'),
  ('doc00001-0000-0000-0000-000000000013', 'p2000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000001', 'Blood Report', '2D Echo + Lipid Profile — Sep 2023',        'https://storage.meddocs.in/suresh/echo_sep2023.pdf',        'doctor',  '2023-09-10 10:00:00+05:30', 'EF 52%; LDL 118 mg/dL — statin continued'),
  ('doc00001-0000-0000-0000-000000000014', 'p2000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000003', 'Prescription', 'Ortho Rx — Pain Management',                'https://storage.meddocs.in/suresh/rx_ortho_sep2023.pdf',    'doctor',  '2023-09-20 11:30:00+05:30', 'Etoricoxib 90mg OD + Pantoprazole 40mg OD'),

  -- Nisha (p04) — Neurology
  ('doc00001-0000-0000-0000-000000000015', 'p2000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000002', 'MRI',          'MRI Spine C-Spine + L-Spine — Jul 2023',   'https://storage.meddocs.in/nisha/mri_spine_jul2023.pdf',    'patient', '2023-07-03 08:30:00+05:30', 'C5-C6 disc prolapse with cord indentation'),
  ('doc00001-0000-0000-0000-000000000016', 'p2000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000002', 'Prescription', 'Neurology Rx — Pregabalin + Physiotherapy', 'https://storage.meddocs.in/nisha/rx_neuro_jul2023.pdf',     'doctor',  '2023-07-03 09:00:00+05:30', 'Pregabalin 75mg BD — cervical radiculopathy'),

  -- Rajesh (p05) — Cardiology + Endocrinology (elderly, comorbidities)
  ('doc00001-0000-0000-0000-000000000017', 'p2000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000001', 'ECG',          'Holter 24-hr ECG — Aug 2023',               'https://storage.meddocs.in/rajesh/holter_aug2023.pdf',      'doctor',  '2023-08-05 07:00:00+05:30', '24-hr Holter: 2 runs of NSVT, clinically stable'),
  ('doc00001-0000-0000-0000-000000000018', 'p2000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'HbA1c + Kidney Function — Sep 2023',        'https://storage.meddocs.in/rajesh/hba1c_kft_sep2023.pdf',  'patient', '2023-09-01 07:30:00+05:30', 'HbA1c 8.2% — poor control; creatinine 1.3 mg/dL'),
  ('doc00001-0000-0000-0000-000000000019', 'p2000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000006', 'Prescription', 'Endocrinology Rx — Insulin Initiation',     'https://storage.meddocs.in/rajesh/rx_insulin_oct2023.pdf', 'doctor',  '2023-10-12 10:30:00+05:30', 'Insulin Glargine 10 units HS; SMBG daily'),
  ('doc00001-0000-0000-0000-000000000020', 'p2000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000001', 'Blood Report', 'Troponin + CK-MB — Jan 2024',               'https://storage.meddocs.in/rajesh/trop_jan2024.pdf',        'patient', '2024-01-20 06:00:00+05:30', 'Troponin I 0.04 ng/mL (borderline); admitted for obs'),

  -- Ananya (p06) — Gynaecology (young, minimal docs)
  ('doc00001-0000-0000-0000-000000000021', 'p2000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000004', 'Prescription', 'Gynaec Rx — Iron + Folic Acid',             'https://storage.meddocs.in/ananya/rx_gynae_sep2023.pdf',   'doctor',  '2023-09-10 11:00:00+05:30', 'Iron 200mg OD + Folic Acid 5mg OD — 90 days'),
  ('doc00001-0000-0000-0000-000000000022', 'p2000001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000004', 'Ultrasound',   'Pelvic USG — Routine Feb 2024',             'https://storage.meddocs.in/ananya/usg_routine_feb2024.pdf','doctor',  '2024-02-20 10:00:00+05:30', 'Normal study; no abnormality detected'),

  -- Mohammed (p07) — Cardiology + Orthopedics + Neurology
  ('doc00001-0000-0000-0000-000000000023', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000001', 'CT Scan',      'CTCA (Coronary Angio) — Oct 2023',          'https://storage.meddocs.in/mohammed/ctca_oct2023.pdf',     'doctor',  '2023-10-05 09:00:00+05:30', 'Calcium score 210; LAD mild plaque, no significant stenosis'),
  ('doc00001-0000-0000-0000-000000000024', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000003', 'X-Ray',        'Lumbar Spine X-Ray — Nov 2023',             'https://storage.meddocs.in/mohammed/lsxray_nov2023.pdf',   'patient', '2023-11-14 08:30:00+05:30', 'L4-L5 disc space narrowing; osteophytes'),
  ('doc00001-0000-0000-0000-000000000025', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000002', 'MRI',          'MRI Lumbar Spine — Dec 2023',               'https://storage.meddocs.in/mohammed/mri_ls_dec2023.pdf',   'doctor',  '2023-12-01 09:30:00+05:30', 'L4-L5 disc extrusion with left L5 root compression'),
  ('doc00001-0000-0000-0000-000000000026', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000001', 'Prescription', 'Cardio Rx — Statin + Antihypertensive',     'https://storage.meddocs.in/mohammed/rx_cardio_dec2023.pdf','doctor',  '2023-12-15 11:00:00+05:30', 'Rosuvastatin 10mg OD + Telmisartan 40mg OD'),

  -- Kavya (p08) — Gynaecology + Endocrinology
  ('doc00001-0000-0000-0000-000000000027', 'p2000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000004', 'Ultrasound',   'Follicular Study USG — Nov 2023',           'https://storage.meddocs.in/kavya/usg_follicle_nov2023.pdf','doctor',  '2023-11-08 09:00:00+05:30', 'Dominant follicle 18mm right ovary on Day 12'),
  ('doc00001-0000-0000-0000-000000000028', 'p2000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'Thyroid Profile — Nov 2023',                'https://storage.meddocs.in/kavya/thyroid_nov2023.pdf',     'patient', '2023-11-08 07:00:00+05:30', 'TSH 5.8 mIU/L — subclinical hypothyroidism'),  -- same day
  ('doc00001-0000-0000-0000-000000000029', 'p2000001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000006', 'Prescription', 'Endocrinology Rx — Levothyroxine',          'https://storage.meddocs.in/kavya/rx_thyroid_nov2023.pdf', 'doctor',  '2023-11-10 10:00:00+05:30', 'Levothyroxine 25mcg OD fasting — recheck TSH after 6 wks'),

  -- Harish (p09) — Cardiology + Orthopedics
  ('doc00001-0000-0000-0000-000000000030', 'p2000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000001', 'ECG',          'Stress Test (TMT) — Dec 2023',              'https://storage.meddocs.in/harish/tmt_dec2023.pdf',        'doctor',  '2023-12-10 08:00:00+05:30', 'Negative TMT at 10 METS; no ST changes'),
  ('doc00001-0000-0000-0000-000000000031', 'p2000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000003', 'X-Ray',        'Hip X-Ray AP + Lateral — Jan 2024',         'https://storage.meddocs.in/harish/hip_xray_jan2024.pdf',  'patient', '2024-01-05 09:00:00+05:30', 'AVN left femoral head Stage II — MRI advised'),
  ('doc00001-0000-0000-0000-000000000032', 'p2000001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000003', 'MRI',          'MRI Hip — Feb 2024',                        'https://storage.meddocs.in/harish/mri_hip_feb2024.pdf',   'doctor',  '2024-02-12 10:00:00+05:30', 'AVN left hip confirmed; conservative management planned'),

  -- Pooja (p10) — Endocrinology (thyroid)
  ('doc00001-0000-0000-0000-000000000033', 'p2000001-0000-0000-0000-000000000010', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'Thyroid Panel + Anti-TPO — Jan 2024',       'https://storage.meddocs.in/pooja/thyroid_jan2024.pdf',     'patient', '2024-01-15 07:30:00+05:30', 'TSH 9.2, Anti-TPO 320 — Hashimoto confirmed'),
  ('doc00001-0000-0000-0000-000000000034', 'p2000001-0000-0000-0000-000000000010', 'd1000001-0000-0000-0000-000000000006', 'Ultrasound',   'Thyroid USG — Jan 2024',                    'https://storage.meddocs.in/pooja/thyroid_usg_jan2024.pdf','doctor',  '2024-01-15 08:00:00+05:30', 'Heterogeneous echotexture; no nodule'),  -- same day
  ('doc00001-0000-0000-0000-000000000035', 'p2000001-0000-0000-0000-000000000010', 'd1000001-0000-0000-0000-000000000006', 'Prescription', 'Endocrinology Rx — Levothyroxine 50mcg',    'https://storage.meddocs.in/pooja/rx_levo_jan2024.pdf',    'doctor',  '2024-01-16 11:00:00+05:30', 'Levothyroxine 50mcg OD; recheck in 8 weeks'),

  -- Vikram (p11) — Orthopedics + Neurology (spine)
  ('doc00001-0000-0000-0000-000000000036', 'p2000001-0000-0000-0000-000000000011', 'd1000001-0000-0000-0000-000000000003', 'MRI',          'MRI Cervical Spine — Feb 2024',             'https://storage.meddocs.in/vikram/mri_cspine_feb2024.pdf','doctor',  '2024-02-05 09:00:00+05:30', 'C6-C7 PIVD with myelopathic changes — surgical opinion advised'),
  ('doc00001-0000-0000-0000-000000000037', 'p2000001-0000-0000-0000-000000000011', 'd1000001-0000-0000-0000-000000000002', 'Other',        'NCS/EMG Report — Feb 2024',                 'https://storage.meddocs.in/vikram/emg_feb2024.pdf',        'doctor',  '2024-02-08 10:00:00+05:30', 'Bilateral C7 radiculopathy; reduced SNAP amplitude'),
  ('doc00001-0000-0000-0000-000000000038', 'p2000001-0000-0000-0000-000000000011', 'd1000001-0000-0000-0000-000000000003', 'Prescription', 'Ortho Rx — Cervical Collar + Rx',           'https://storage.meddocs.in/vikram/rx_ortho_feb2024.pdf',  'doctor',  '2024-02-10 11:30:00+05:30', 'Etoricoxib 90mg OD + soft cervical collar 3 weeks'),

  -- Rekha (p12) — Multi-specialty (3 doctors)
  ('doc00001-0000-0000-0000-000000000039', 'p2000001-0000-0000-0000-000000000012', 'd1000001-0000-0000-0000-000000000001', 'ECG',          'Resting ECG — Mar 2024',                    'https://storage.meddocs.in/rekha/ecg_mar2024.pdf',         'patient', '2024-03-02 08:30:00+05:30', 'LVH pattern; hypertensive heart disease'),
  ('doc00001-0000-0000-0000-000000000040', 'p2000001-0000-0000-0000-000000000012', 'd1000001-0000-0000-0000-000000000004', 'Ultrasound',   'Pelvic + Abdomen USG — Mar 2024',           'https://storage.meddocs.in/rekha/usg_mar2024.pdf',         'doctor',  '2024-03-02 09:00:00+05:30', 'Fibroid uterus 3.2cm; no adnexal mass'),  -- same day
  ('doc00001-0000-0000-0000-000000000041', 'p2000001-0000-0000-0000-000000000012', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'HbA1c + Lipid + KFT — Mar 2024',            'https://storage.meddocs.in/rekha/labs_mar2024.pdf',        'patient', '2024-03-03 07:00:00+05:30', 'HbA1c 7.4%; LDL 135; creatinine WNL'),

  -- Lalita (p14) — Elderly multi-specialty
  ('doc00001-0000-0000-0000-000000000042', 'p2000001-0000-0000-0000-000000000014', 'd1000001-0000-0000-0000-000000000003', 'X-Ray',        'Lumbar Spine + Hip X-Ray — Apr 2024',       'https://storage.meddocs.in/lalita/ls_hip_xray_apr24.pdf', 'patient', '2024-04-15 09:00:00+05:30', 'Severe osteoporosis; L3 old compression fracture'),
  ('doc00001-0000-0000-0000-000000000043', 'p2000001-0000-0000-0000-000000000014', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'Calcium + Vitamin D + PTH — Apr 2024',      'https://storage.meddocs.in/lalita/calcium_apr2024.pdf',   'doctor',  '2024-04-15 10:00:00+05:30', 'Vit D 12 ng/mL — severe deficiency; Ca 8.2 mg/dL'),
  ('doc00001-0000-0000-0000-000000000044', 'p2000001-0000-0000-0000-000000000014', 'd1000001-0000-0000-0000-000000000002', 'Other',        'MMSE Cognitive Assessment — Apr 2024',      'https://storage.meddocs.in/lalita/mmse_apr2024.pdf',      'doctor',  '2024-04-16 11:00:00+05:30', 'MMSE 22/30 — mild cognitive impairment; follow up'),
  ('doc00001-0000-0000-0000-000000000045', 'p2000001-0000-0000-0000-000000000014', 'd1000001-0000-0000-0000-000000000003', 'Prescription', 'Ortho Rx — Bisphosphonate + Supplements',   'https://storage.meddocs.in/lalita/rx_ortho_apr2024.pdf',  'doctor',  '2024-04-17 10:30:00+05:30', 'Alendronate 70mg weekly + Ca 500mg + Vit D3 60K weekly'),

  -- Mixed / additional edge case docs
  ('doc00001-0000-0000-0000-000000000046', 'p2000001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000001', 'Prescription', 'Cardio Follow-up Rx — May 2024',            'https://storage.meddocs.in/suresh/rx_cardio_may2024.pdf', 'doctor',  '2024-05-10 10:00:00+05:30', 'Clopidogrel + Rosuvastatin — 6-month post stent follow up'),
  ('doc00001-0000-0000-0000-000000000047', 'p2000001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000003', 'Prescription', 'Ortho Rx Post MRI — Jan 2024',              'https://storage.meddocs.in/mohammed/rx_ortho_jan2024.pdf','doctor',  '2024-01-10 11:00:00+05:30', 'Traction + physiotherapy 4 weeks; surgical opinion pending'),
  ('doc00001-0000-0000-0000-000000000048', 'p2000001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000006', 'Prescription', 'Endocrinology Rx — Jan 2024',               'https://storage.meddocs.in/amit/rx_endo_jan2024.pdf',     'doctor',  '2024-01-22 09:30:00+05:30', 'Pre-diabetes management: Metformin 500mg BD + lifestyle'),
  ('doc00001-0000-0000-0000-000000000049', 'p2000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000006', 'Blood Report', 'Diabetes Panel Q2 2024 — Apr 2024',         'https://storage.meddocs.in/rajesh/dm_panel_apr2024.pdf',  'patient', '2024-04-02 07:15:00+05:30', 'HbA1c improved to 7.1% on insulin; microalbumin neg'),
  ('doc00001-0000-0000-0000-000000000050', 'p2000001-0000-0000-0000-000000000012', 'd1000001-0000-0000-0000-000000000001', 'Blood Report', 'BNP + Echo Follow-up — May 2024',           'https://storage.meddocs.in/rekha/bnp_may2024.pdf',        'patient', '2024-05-14 08:00:00+05:30', 'BNP 180 pg/mL; diastolic dysfunction Grade I');
  -- NOTE: Patients 13 (Sanjay) and 15 (Arjun) have no documents (edge case)



INSERT INTO prescriptions
(
    prescription_id,
    patient_id,
    doctor_id,
    advice
)
VALUES
(
    'pres001',
    'p2000001-0000-0000-0000-000000000001',
    'd1000001-0000-0000-0000-000000000001',
    'Drink plenty of water and rest'
);


-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS  (30 records)
-- Covers: doctors (premium/free), patients, admin
-- Edge cases: expired, trial, cancelled, active
-- ─────────────────────────────────────────────
INSERT INTO subscriptions VALUES
  -- Doctor subscriptions
  ('sub00001-0000-0000-0000-000000000001', 'd1000001-0000-0000-0000-000000000001', 'doctor',  'premium',    'active',    '2024-01-01 00:00:00+05:30', '2025-01-01 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000002', 'd1000001-0000-0000-0000-000000000002', 'doctor',  'premium',    'active',    '2024-03-01 00:00:00+05:30', '2025-03-01 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000003', 'd1000001-0000-0000-0000-000000000003', 'doctor',  'free',       'active',    '2023-07-04 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000004', 'doctor',  'premium',    'active',    '2024-02-01 00:00:00+05:30', '2025-02-01 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000005', 'doctor',  'free',       'active',    '2024-01-07 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000006', 'd1000001-0000-0000-0000-000000000006', 'doctor',  'premium',    'active',    '2024-02-14 00:00:00+05:30', '2025-02-14 00:00:00+05:30'),
  -- Doctor historical/expired subscriptions
  ('sub00001-0000-0000-0000-000000000007', 'd1000001-0000-0000-0000-000000000001', 'doctor',  'premium',    'expired',   '2023-01-01 00:00:00+05:30', '2024-01-01 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000008', 'd1000001-0000-0000-0000-000000000003', 'doctor',  'premium',    'expired',   '2022-07-01 00:00:00+05:30', '2023-07-01 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000009', 'd1000001-0000-0000-0000-000000000005', 'doctor',  'trial',      'expired',   '2024-01-07 00:00:00+05:30', '2024-02-07 00:00:00+05:30'),
  -- Patient subscriptions (premium features)
  ('sub00001-0000-0000-0000-000000000010', 'p2000001-0000-0000-0000-000000000001', 'patient', 'premium',    'active',    '2024-01-01 00:00:00+05:30', '2025-01-01 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000011', 'p2000001-0000-0000-0000-000000000002', 'patient', 'free',       'active',    '2023-04-15 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000012', 'p2000001-0000-0000-0000-000000000003', 'patient', 'premium',    'expired',   '2023-05-10 00:00:00+05:30', '2024-05-10 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000013', 'p2000001-0000-0000-0000-000000000004', 'patient', 'free',       'active',    '2023-06-20 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000014', 'p2000001-0000-0000-0000-000000000005', 'patient', 'premium',    'active',    '2024-01-20 00:00:00+05:30', '2025-01-20 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000015', 'p2000001-0000-0000-0000-000000000006', 'patient', 'free',       'active',    '2023-08-25 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000016', 'p2000001-0000-0000-0000-000000000007', 'patient', 'premium',    'cancelled', '2023-09-02 00:00:00+05:30', '2024-03-02 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000017', 'p2000001-0000-0000-0000-000000000008', 'patient', 'trial',      'expired',   '2023-10-14 00:00:00+05:30', '2023-11-14 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000018', 'p2000001-0000-0000-0000-000000000008', 'patient', 'premium',    'active',    '2023-11-15 00:00:00+05:30', '2024-11-15 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000019', 'p2000001-0000-0000-0000-000000000009', 'patient', 'free',       'active',    '2023-11-05 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000020', 'p2000001-0000-0000-0000-000000000010', 'patient', 'premium',    'active',    '2024-01-15 00:00:00+05:30', '2025-01-15 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000021', 'p2000001-0000-0000-0000-000000000011', 'patient', 'free',       'active',    '2024-01-18 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000022', 'p2000001-0000-0000-0000-000000000012', 'patient', 'enterprise', 'active',    '2024-02-09 00:00:00+05:30', '2025-02-09 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000023', 'p2000001-0000-0000-0000-000000000013', 'patient', 'free',       'active',    '2024-03-22 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000024', 'p2000001-0000-0000-0000-000000000014', 'patient', 'premium',    'active',    '2024-04-11 00:00:00+05:30', '2025-04-11 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000025', 'p2000001-0000-0000-0000-000000000015', 'patient', 'free',       'active',    '2024-05-03 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  -- Admin subscriptions
  ('sub00001-0000-0000-0000-000000000026', 'a3000001-0000-0000-0000-000000000001', 'admin',   'enterprise', 'active',    '2023-01-01 00:00:00+05:30', '2026-01-01 00:00:00+05:30'),
  -- Additional historical patient records (analytics edge cases)
  ('sub00001-0000-0000-0000-000000000027', 'p2000001-0000-0000-0000-000000000001', 'patient', 'free',       'expired',   '2023-04-01 00:00:00+05:30', '2023-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000028', 'p2000001-0000-0000-0000-000000000007', 'patient', 'free',       'active',    '2024-03-02 00:00:00+05:30', '2099-12-31 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000029', 'p2000001-0000-0000-0000-000000000005', 'patient', 'trial',      'expired',   '2023-09-01 00:00:00+05:30', '2023-10-01 00:00:00+05:30'),
  ('sub00001-0000-0000-0000-000000000030', 'd1000001-0000-0000-0000-000000000002', 'doctor',  'premium',    'expired',   '2023-03-01 00:00:00+05:30', '2024-03-01 00:00:00+05:30');


--  ──────────────────────────────────────────────────────────────────────────────────────────
--  INSERTION OF MASTER VALUES FOR OTHER TABLES, EXCEPT MEDICINE (SAMPLES)
--  ──────────────────────────────────────────────────────────────────────────────────────────
INSERT INTO history_master (history_name)
VALUES
('Diabetes'),
('Hypertension'),
('Thyroid Disorder'),
('PCOS'),
('Asthma'),
('Heart Disease'),
('Kidney Disease'),
('Liver Disease'),
('Tuberculosis'),
('Epilepsy'),
('Drug Allergy'),
('Food Allergy'),
('Smoking'),
('Alcohol Consumption'),
('Previous Surgery')
ON CONFLICT DO NOTHING;

INSERT INTO illness_master (illness_name)
VALUES
('Viral Fever'),
('Typhoid'),
('Dengue'),
('Malaria'),
('Migraine'),
('Gastritis'),
('GERD'),
('Urinary Tract Infection'),
('Kidney Stone'),
('Hypertension'),
('Type 2 Diabetes'),
('Asthma'),
('COPD'),
('Hypothyroidism'),
('Hyperthyroidism'),
('Anxiety Disorder'),
('Depression'),
('Pneumonia'),
('Bronchitis'),
('Sinusitis'),
('COVID-19'),
('Influenza'),
('Food Poisoning'),
('Osteoarthritis'),
('Rheumatoid Arthritis'),
('Fever'),
('Headache'),
('Cough'),
('Cold'),
('Sore Throat'),
('Body Ache'),
('Chest Pain'),
('Shortness of Breath'),
('Nausea'),
('Vomiting'),
('Loose Motion'),
('Constipation'),
('Abdominal Pain'),
('Burning Urination'),
('Back Pain'),
('Neck Pain'),
('Joint Pain'),
('Dizziness'),
('Weakness'),
('Fatigue'),
('Loss of Appetite'),
('Hair Fall'),
('Skin Rash'),
('Itching'),
('Sneezing'),
('Runny Nose'),
('Palpitations'),
('Weight Gain'),
('Weight Loss'),
('Insomnia')
ON CONFLICT DO NOTHING;

-- INSERT INTO symptom_master (symptom_name)
-- VALUES
-- ('Fever'),
-- ('Headache'),
-- ('Cough'),
-- ('Cold'),
-- ('Sore Throat'),
-- ('Body Ache'),
-- ('Chest Pain'),
-- ('Shortness of Breath'),
-- ('Nausea'),
-- ('Vomiting'),
-- ('Loose Motion'),
-- ('Constipation'),
-- ('Abdominal Pain'),
-- ('Burning Urination'),
-- ('Back Pain'),
-- ('Neck Pain'),
-- ('Joint Pain'),
-- ('Dizziness'),
-- ('Weakness'),
-- ('Fatigue'),
-- ('Loss of Appetite'),
-- ('Hair Fall'),
-- ('Skin Rash'),
-- ('Itching'),
-- ('Sneezing'),
-- ('Runny Nose'),
-- ('Palpitations'),
-- ('Weight Gain'),
-- ('Weight Loss'),
-- ('Insomnia')
-- ON CONFLICT DO NOTHING;

INSERT INTO advice_master (advice_text)
VALUES
('Take adequate rest'),
('Drink plenty of water'),
('Regular exercise'),
('Avoid oily foods'),
('Avoid spicy foods'),
('Low salt diet'),
('Low sugar diet'),
('Steam inhalation'),
('Complete antibiotic course'),
('Monitor blood pressure daily'),
('Monitor blood sugar regularly'),
('Avoid smoking'),
('Avoid alcohol'),
('Follow diabetic diet'),
('Maintain healthy weight'),
('Increase protein intake'),
('Take medicines on time'),
('Use warm salt water gargles'),
('Avoid cold drinks'),
('Get adequate sleep'),
('Follow up after 7 days'),
('Follow up after 15 days'),
('Follow up after 1 month')
ON CONFLICT DO NOTHING;




-- ─────────────────────────────────────────────
-- USEFUL INDEXES FOR DASHBOARD / SEARCH QUERIES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patient_doctors_patient ON patient_doctors(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_doctors_doctor  ON patient_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient       ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_doctor        ON documents(doctor_id);
CREATE INDEX IF NOT EXISTS idx_documents_type          ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date   ON documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user      ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status    ON subscriptions(status);

