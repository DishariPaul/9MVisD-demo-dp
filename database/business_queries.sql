--- ============ Patient Login ================
SELECT
    p.patient_name,
    p.phone_number,
    d.doctor_name
FROM patients p
JOIN patient_doctors pd
ON p.patient_id = pd.patient_id
JOIN doctors d
ON d.doctor_id = pd.doctor_id;


--- ====================== Patient History =================
SELECT
    title,
    type,
    upload_date
FROM documents
WHERE patient_id =
'p2000001-0000-0000-0000-000000000001'
ORDER BY upload_date DESC;


--- ======================= Doctor's Dashboard ======================
SELECT
    d.doctor_name,
    COUNT(pd.patient_id) AS patient_count
FROM doctors d
LEFT JOIN patient_doctors pd
ON d.doctor_id = pd.doctor_id
GROUP BY d.doctor_name;


--- ======================= Premium Check ===============================
SELECT *
FROM subscriptions
WHERE user_id =
'p2000001-0000-0000-0000-000000000001'
AND status = 'active';
