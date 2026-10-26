-- PIL Portal Demo Data Seed Script (Fixed)
-- All documents and attachments stored in PostgreSQL JSONB

BEGIN;

-- Clean existing demo data
DELETE FROM audit_log;
DELETE FROM notification WHERE recipient_agent_code IS NOT NULL OR request_id_ref IS NOT NULL;
DELETE FROM payment_request;

-- Restore the auto-submitted one from earlier
-- Then insert full demo dataset

INSERT INTO payment_request (
  request_id, request_type, agent_code, beneficiary_name, currency,
  original_amount, roe, usd_equivalent,
  remittance_bank, bank_account_number, swift_code,
  status, initiated_by,
  gfsu_observation, gfsu_reviewed_by, gfsu_reviewed_at,
  cac_observation, cac_reviewed_by, cac_reviewed_at,
  treasury_reviewed_by, treasury_reviewed_at,
  ap_routing_email, gfsu_final_remarks, gfsu_forwarded_by, gfsu_forwarded_at,
  actual_release_date, mt103_url,
  payment_initiated, lms_entry_recorded,
  documents, query_thread,
  submission_date, created_date, updated_date
) VALUES
(
  'PR-2026-NIG-0001','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  1000.00,1.0,1000.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Submitted','Agent',
  NULL,NULL,NULL, NULL,NULL,NULL, NULL,NULL,
  NULL,NULL,NULL,NULL, NULL,NULL,
  false,false,'[]','[]',
  NOW()-INTERVAL'1 hour', NOW()-INTERVAL'1 hour', NOW()-INTERVAL'1 hour'
),
(
  'PR-2026-NIG-0020','ASA Settlement','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  15000.00,1.0,15000.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Treasury Approved - Pending GFSU Verification','GFSU',
  'ASA settlement verified, all docs in order.','Vaishnavedevi Bala',NOW()-INTERVAL'2 days',
  'CAC approved for ASA.','Priya Krishnan',NOW()-INTERVAL'1 day',
  'Vaishnavedevi Bala',NOW()-INTERVAL'12 hours',
  NULL,NULL,NULL,NULL, NULL,NULL,
  false,false,'[]','[]',
  NOW()-INTERVAL'3 days', NOW()-INTERVAL'3 days', NOW()-INTERVAL'12 hours'
),
(
  'PR-2026-NIG-0021','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  5500.00,1.0,5500.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Ready for SG AP Execution','Agent',
  'Verified.','Vaishnavedevi Bala',NOW()-INTERVAL'5 days',
  'Approved.','Priya Krishnan',NOW()-INTERVAL'4 days',
  'Vaishnavedevi Bala',NOW()-INTERVAL'3 days',
  'sgap@pil.com','Ready for execution.','Vaishnavedevi Bala',NOW()-INTERVAL'2 days',
  NULL,NULL, false,false,'[]','[]',
  NOW()-INTERVAL'6 days', NOW()-INTERVAL'6 days', NOW()-INTERVAL'2 days'
),
(
  'PR-2026-NIG-0022','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  75000.00,1.0,75000.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Rejected by CAC','Agent',
  'Documents reviewed.','Vaishnavedevi Bala',NOW()-INTERVAL'10 days',
  'Insufficient supporting docs for high-value transaction.','Priya Krishnan',NOW()-INTERVAL'9 days',
  NULL,NULL, NULL,NULL,NULL,NULL, NULL,NULL,
  false,false,'[]','[]',
  NOW()-INTERVAL'11 days', NOW()-INTERVAL'11 days', NOW()-INTERVAL'9 days'
),
(
  'PR-2026-NIG-0023','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  2500.00,1.0,2500.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'CAC Approved','Agent',
  'Verified and forwarded.','Vaishnavedevi Bala',NOW()-INTERVAL'5 days',
  'CAC approved.','Priya Krishnan',NOW()-INTERVAL'4 days',
  NULL,NULL, NULL,NULL,NULL,NULL, NULL,NULL,
  false,false,'[]','[]',
  NOW()-INTERVAL'6 days', NOW()-INTERVAL'6 days', NOW()-INTERVAL'4 days'
),
(
  'PR-2026-NIG-0024','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  888.00,1.0,888.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'CAC Pending','Agent',
  'Verified. Docs complete.','Vaishnavedevi Bala',NOW()-INTERVAL'3 days',
  NULL,NULL,NULL, NULL,NULL, NULL,NULL,NULL,NULL, NULL,NULL,
  false,false,'[]','[]',
  NOW()-INTERVAL'4 days', NOW()-INTERVAL'4 days', NOW()-INTERVAL'3 days'
),
(
  'PR-2026-NIG-0025','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  990.00,1.0,990.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Submitted','Agent',
  NULL,NULL,NULL, NULL,NULL,NULL, NULL,NULL, NULL,NULL,NULL,NULL, NULL,NULL,
  false,false,'[]','[]',
  NOW()-INTERVAL'2 days', NOW()-INTERVAL'2 days', NOW()-INTERVAL'2 days'
),
(
  'PR-2026-NIG-0026','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  850.00,1.0,850.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Paid','Agent',
  'OK.','Vaishnavedevi Bala',NOW()-INTERVAL'20 days',
  'Approved.','Priya Krishnan',NOW()-INTERVAL'19 days',
  'Vaishnavedevi Bala',NOW()-INTERVAL'18 days',
  'sgap@pil.com','Sent to AP.','Vaishnavedevi Bala',NOW()-INTERVAL'17 days',
  (NOW()-INTERVAL'16 days')::date,'STORED_IN_PG',
  true,true,'[]','[]',
  NOW()-INTERVAL'21 days', NOW()-INTERVAL'21 days', NOW()-INTERVAL'16 days'
),
(
  'PR-2026-NIG-0027','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  1000.00,1.0,1000.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Paid','Agent',
  'Verified OK.','Vaishnavedevi Bala',NOW()-INTERVAL'14 days',
  'CAC approved.','Priya Krishnan',NOW()-INTERVAL'13 days',
  'Vaishnavedevi Bala',NOW()-INTERVAL'12 days',
  'sgap@pil.com','Forwarded to SG AP.','Vaishnavedevi Bala',NOW()-INTERVAL'11 days',
  (NOW()-INTERVAL'10 days')::date,'STORED_IN_PG',
  true,true,'[]','[]',
  NOW()-INTERVAL'15 days', NOW()-INTERVAL'15 days', NOW()-INTERVAL'10 days'
),
(
  'PR-2026-NIG-0028','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  1200.00,1.0,1200.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Paid','Agent',
  'Verified - all docs in order.','Vaishnavedevi Bala',NOW()-INTERVAL'8 days',
  'Approved by CAC committee.','Priya Krishnan',NOW()-INTERVAL'7 days',
  'Vaishnavedevi Bala',NOW()-INTERVAL'6 days',
  'sgap@pil.com','Forwarded to SG AP.','Vaishnavedevi Bala',NOW()-INTERVAL'5 days',
  (NOW()-INTERVAL'4 days')::date,'STORED_IN_PG',
  true,true,'[]','[]',
  NOW()-INTERVAL'9 days', NOW()-INTERVAL'9 days', NOW()-INTERVAL'4 days'
),
(
  'PR-2026-NIG-0029','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
  981.00,1.0,981.00,
  'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
  'Under GFSU Review','Agent',
  NULL,NULL,NULL, NULL,NULL,NULL, NULL,NULL, NULL,NULL,NULL,NULL, NULL,NULL,
  false,false,'[]','[]',
  NOW()-INTERVAL'1 day', NOW()-INTERVAL'1 day', NOW()-INTERVAL'1 day'
);

-- Audit logs
INSERT INTO audit_log (request_id, actor_id, actor_role, action, previous_status, new_status, remarks, created_date) VALUES
('PR-2026-NIG-0028','U002','GFSU_AC','GFSU_APPROVED','Under GFSU Review','CAC Pending','Verified - all docs in order.',NOW()-INTERVAL'8 days'),
('PR-2026-NIG-0028','U003','CAC','CAC_APPROVED','CAC Pending','CAC Approved','Approved by committee.',NOW()-INTERVAL'7 days'),
('PR-2026-NIG-0028','U004','TREASURY','TREASURY_APPROVED','CAC Approved','Treasury Approved - Pending GFSU Verification','Authorized.',NOW()-INTERVAL'6 days'),
('PR-2026-NIG-0028','U002','GFSU_AC','GFSU_FORWARDED_TO_AP','Treasury Approved - Pending GFSU Verification','Ready for SG AP Execution','Forwarded to AP.',NOW()-INTERVAL'5 days'),
('PR-2026-NIG-0028','U005','SG_AP','PAYMENT_EXECUTED','Ready for SG AP Execution','Paid','MT103 uploaded, payment completed.',NOW()-INTERVAL'4 days'),
('PR-2026-NIG-0027','U002','GFSU_AC','GFSU_APPROVED','Under GFSU Review','CAC Pending','Verified OK.',NOW()-INTERVAL'14 days'),
('PR-2026-NIG-0027','U003','CAC','CAC_APPROVED','CAC Pending','CAC Approved','Approved.',NOW()-INTERVAL'13 days'),
('PR-2026-NIG-0027','U004','TREASURY','TREASURY_APPROVED','CAC Approved','Treasury Approved - Pending GFSU Verification','Authorized.',NOW()-INTERVAL'12 days'),
('PR-2026-NIG-0027','U005','SG_AP','PAYMENT_EXECUTED','Ready for SG AP Execution','Paid','Payment completed.',NOW()-INTERVAL'10 days'),
('PR-2026-NIG-0022','U003','CAC','CAC_REJECTED','CAC Pending','Rejected by CAC','Insufficient supporting docs.',NOW()-INTERVAL'9 days');

-- Notifications
INSERT INTO notification (recipient_role, recipient_agent_code, title, body, request_id_ref, read, created_date) VALUES
('Agent','PIL_NIGERIA','Payment Successful','Your request PR-2026-NIG-0028 has been paid successfully.','PR-2026-NIG-0028',false,NOW()-INTERVAL'4 days'),
('Agent','PIL_NIGERIA','Payment Successful','Your request PR-2026-NIG-0027 has been paid successfully.','PR-2026-NIG-0027',false,NOW()-INTERVAL'10 days'),
('Agent','PIL_NIGERIA','Payment Successful','Your request PR-2026-NIG-0026 has been paid successfully.','PR-2026-NIG-0026',false,NOW()-INTERVAL'16 days'),
('Agent','PIL_NIGERIA','Request Rejected by CAC','Your request PR-2026-NIG-0022 was rejected: Insufficient supporting docs.','PR-2026-NIG-0022',false,NOW()-INTERVAL'9 days'),
('GFSU',NULL,'New Request Submitted','New Pre-Funding PR-2026-NIG-0029 submitted by PIL_NIGERIA.','PR-2026-NIG-0029',false,NOW()-INTERVAL'1 day'),
('GFSU',NULL,'New Request Submitted','New Pre-Funding PR-2026-NIG-0025 submitted by PIL_NIGERIA.','PR-2026-NIG-0025',false,NOW()-INTERVAL'2 days'),
('CAC',NULL,'Request Ready for CAC Review','Pre-Funding PR-2026-NIG-0024 is ready for CAC approval.','PR-2026-NIG-0024',false,NOW()-INTERVAL'3 days'),
('Treasury',NULL,'CAC Approved - Treasury Required','Request PR-2026-NIG-0023 approved by CAC. Awaiting Treasury.','PR-2026-NIG-0023',false,NOW()-INTERVAL'4 days'),
('SG_AP',NULL,'Request Ready for Execution','Request PR-2026-NIG-0021 is ready for payment execution.','PR-2026-NIG-0021',false,NOW()-INTERVAL'2 days');

COMMIT;

SELECT 'Seeded ' || COUNT(*) || ' payment requests' AS result FROM payment_request;
