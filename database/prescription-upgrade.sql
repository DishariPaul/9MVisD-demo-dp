ALTER TABLE prescriptions ADD COLUMN weight VARCHAR(20); 
ALTER TABLE prescriptions ADD COLUMN height VARCHAR(20); 
ALTER TABLE prescriptions ADD COLUMN pulse VARCHAR(20); 
ALTER TABLE prescriptions ADD COLUMN blood_pressure VARCHAR(20); 
ALTER TABLE prescriptions ADD COLUMN temperature VARCHAR(20); 
ALTER TABLE prescriptions ADD COLUMN respiratory_rate VARCHAR(20); 
ALTER TABLE prescriptions ADD COLUMN history TEXT[]; 
ALTER TABLE prescriptions ADD COLUMN illnesses TEXT[]; 
ALTER TABLE prescriptions ADD COLUMN symptoms TEXT[]; 
ALTER TABLE prescriptions ADD COLUMN follow_up_date DATE;




