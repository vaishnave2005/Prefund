-- PIL Portal Demo Data Seed Script
-- Seeds realistic payment requests matching the dashboard screenshots

-- First clear existing test data
DELETE FROM audit_log WHERE request_id LIKE 'PR-2026-NIG-%';
DELETE FROM notification WHERE request_id_ref LIKE 'PR-2026-NIG-%';
DELETE FROM payment_request WHERE agent_code = 'PIL_NIGERIA';

-- Insert 10 Pre-Funding requests for PIL_NIGERIA (Agent demo user)
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

-- PR-0029: Under GFSU Review
('PR-2026-NIG-0029','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 981.00,1.0,981.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Under GFSU Review','Agent',
 NULL,NULL,NULL,
 NULL,NULL,NULL,
 NULL,NULL,
 NULL,NULL,NULL,NULL,
 NULL,NULL,
 false,false,
 '[]','[]',
 NOW()-INTERVAL'1 day', NOW()-INTERVAL'1 day', NOW()-INTERVAL'1 day'),

-- PR-0028: Paid with MT103
('PR-2026-NIG-0028','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 1200.00,1.0,1200.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Paid','Agent',
 'Verified - all docs in order.','Vaishnavedevi Bala',NOW()-INTERVAL'8 days',
 'Approved by CAC committee.','Priya Krishnan',NOW()-INTERVAL'7 days',
 'Treasury authorized.', NOW()-INTERVAL'6 days',
 'sgap@pil.com','Forwarded to SG AP.','Vaishnavedevi Bala', NOW()-INTERVAL'5 days',
 (NOW()-INTERVAL'4 days')::date, '/uploads/mt103-NIG-0028.pdf',
 true,true,
 '[]','[]',
 NOW()-INTERVAL'9 days', NOW()-INTERVAL'9 days', NOW()-INTERVAL'4 days'),

-- PR-0027: Paid with MT103
('PR-2026-NIG-0027','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 1000.00,1.0,1000.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Paid','Agent',
 'Verified OK.','Vaishnavedevi Bala',NOW()-INTERVAL'14 days',
 'CAC approved.','Priya Krishnan',NOW()-INTERVAL'13 days',
 'Treasury authorized.', NOW()-INTERVAL'12 days',
 'sgap@pil.com','Forwarded to SG AP.','Vaishnavedevi Bala', NOW()-INTERVAL'11 days',
 (NOW()-INTERVAL'10 days')::date, '/uploads/mt103-NIG-0027.pdf',
 true,true,
 '[]','[]',
 NOW()-INTERVAL'15 days', NOW()-INTERVAL'15 days', NOW()-INTERVAL'10 days'),

-- PR-0026: Paid with MT103
('PR-2026-NIG-0026','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 850.00,1.0,850.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Paid','Agent',
 'OK.','Vaishnavedevi Bala',NOW()-INTERVAL'20 days',
 'Approved.','Priya Krishnan',NOW()-INTERVAL'19 days',
 'Authorized.', NOW()-INTERVAL'18 days',
 'sgap@pil.com','Sent to AP.','Vaishnavedevi Bala', NOW()-INTERVAL'17 days',
 (NOW()-INTERVAL'16 days')::date, '/uploads/mt103-NIG-0026.pdf',
 true,true,
 '[]','[]',
 NOW()-INTERVAL'21 days', NOW()-INTERVAL'21 days', NOW()-INTERVAL'16 days'),

-- PR-0025: Submitted
('PR-2026-NIG-0025','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 990.00,1.0,990.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Submitted','Agent',
 NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
 NULL,NULL,NULL,NULL,NULL,NULL,
 false,false,'[]','[]',
 NOW()-INTERVAL'2 days', NOW()-INTERVAL'2 days', NOW()-INTERVAL'2 days'),

-- PR-0024: CAC Pending
('PR-2026-NIG-0024','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 888.00,1.0,888.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'CAC Pending','Agent',
 'Verified. Docs complete.','Vaishnavedevi Bala',NOW()-INTERVAL'3 days',
 NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
 false,false,'[]','[]',
 NOW()-INTERVAL'4 days', NOW()-INTERVAL'4 days', NOW()-INTERVAL'3 days'),

-- PR-0023: CAC Approved (Treasury pending)
('PR-2026-NIG-0023','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 2500.00,1.0,2500.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'CAC Approved','Agent',
 'Verified and forwarded.','Vaishnavedevi Bala',NOW()-INTERVAL'5 days',
 'CAC approved.','Priya Krishnan',NOW()-INTERVAL'4 days',
 NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
 false,false,'[]','[]',
 NOW()-INTERVAL'6 days', NOW()-INTERVAL'6 days', NOW()-INTERVAL'4 days'),

-- PR-0022: Rejected by CAC
('PR-2026-NIG-0022','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 75000.00,1.0,75000.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Rejected by CAC','Agent',
 'Documents reviewed.','Vaishnavedevi Bala',NOW()-INTERVAL'10 days',
 'Insufficient supporting docs for high-value transaction.','Priya Krishnan',NOW()-INTERVAL'9 days',
 NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
 false,false,'[]','[]',
 NOW()-INTERVAL'11 days', NOW()-INTERVAL'11 days', NOW()-INTERVAL'9 days'),

-- PR-0021: Ready for SG AP Execution
('PR-2026-NIG-0021','Pre-Funding','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 5500.00,1.0,5500.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Ready for SG AP Execution','Agent',
 'Verified.','Vaishnavedevi Bala',NOW()-INTERVAL'5 days',
 'Approved.','Priya Krishnan',NOW()-INTERVAL'4 days',
 'Treasury authorized.', NOW()-INTERVAL'3 days',
 'sgap@pil.com','Ready for execution.','Vaishnavedevi Bala', NOW()-INTERVAL'2 days',
 NULL,NULL,false,false,'[]','[]',
 NOW()-INTERVAL'6 days', NOW()-INTERVAL'6 days', NOW()-INTERVAL'2 days'),

-- PR-0001 (the one just submitted): Already exists, skip
-- Add an ASA Settlement
('PR-2026-NIG-0020','ASA Settlement','PIL_NIGERIA','PIL Nigeria Ltd','USD',
 15000.00,1.0,15000.00,
 'Citibank Nigeria Ltd — Lagos — Lagos, Nigeria','0012345678','CITINGLA',
 'Treasury Approved - Pending GFSU Verification','GFSU',
 'ASA settlement verified.','Vaishnavedevi Bala',NOW()-INTERVAL'2 days',
 'CAC approved.','Priya Krishnan',NOW()-INTERVAL'1 day',
 'Treasury authorized.', NOW()-INTERVAL'12 hours',
 NULL,NULL,NULL,NULL,NULL,NULL,
 false,false,'[]','[]',
 NOW()-INTERVAL'3 days', NOW()-INTERVAL'3 days', NOW()-INTERVAL'12 hours');

-- Seed audit logs for key transitions
INSERT INTO audit_log (request_id, actor_id, actor_role, action, previous_status, new_status, remarks, created_date)
SELECT 'PR-2026-NIG-0028', 'U002', 'GFSU_AC', 'GFSU_APPROVED', 'Under GFSU Review', 'CAC Pending', 'Verified - all docs in order.', NOW()-INTERVAL'8 days'
WHERE NOT EXISTS (SELECT 1 FROM audit_log WHERE request_id='PR-2026-NIG-0028' AND action='GFSU_APPROVED');

INSERT INTO audit_log (request_id, actor_id, actor_role, action, previous_status, new_status, remarks, created_date)
SELECT 'PR-2026-NIG-0028', 'U003', 'CAC', 'CAC_APPROVED', 'CAC Pending', 'CAC Approved', 'Approved by committee.', NOW()-INTERVAL'7 days'
WHERE NOT EXISTS (SELECT 1 FROM audit_log WHERE request_id='PR-2026-NIG-0028' AND action='CAC_APPROVED');

INSERT INTO audit_log (request_id, actor_id, actor_role, action, previous_status, new_status, remarks, created_date)
SELECT 'PR-2026-NIG-0028', 'U004', 'TREASURY', 'TREASURY_APPROVED', 'CAC Approved', 'Treasury Approved - Pending GFSU Verification', 'Authorized.', NOW()-INTERVAL'6 days'
WHERE NOT EXISTS (SELECT 1 FROM audit_log WHERE request_id='PR-2026-NIG-0028' AND action='TREASURY_APPROVED');

-- Seed notifications
INSERT INTO notification (recipient_role, recipient_agent_code, title, body, request_id_ref, read, created_date)
VALUES 
('Agent','PIL_NIGERIA','Payment Successful','Your request PR-2026-NIG-0028 has been paid successfully.','PR-2026-NIG-0028',false,NOW()-INTERVAL'4 days'),
('Agent','PIL_NIGERIA','Payment Successful','Your request PR-2026-NIG-0027 has been paid successfully.','PR-2026-NIG-0027',false,NOW()-INTERVAL'10 days'),
('Agent','PIL_NIGERIA','Payment Successful','Your request PR-2026-NIG-0026 has been paid successfully.','PR-2026-NIG-0026',false,NOW()-INTERVAL'16 days'),
('Agent','PIL_NIGERIA','Request Rejected','Your request PR-2026-NIG-0022 was rejected by CAC: Insufficient supporting docs.','PR-2026-NIG-0022',false,NOW()-INTERVAL'9 days'),
('GFSU','NULL','New Request Submitted','New Pre-Funding request PR-2026-NIG-0029 submitted by PIL_NIGERIA.','PR-2026-NIG-0029',false,NOW()-INTERVAL'1 day'),
('GFSU','NULL','New Request Submitted','New Pre-Funding request PR-2026-NIG-0025 submitted by PIL_NIGERIA.','PR-2026-NIG-0025',false,NOW()-INTERVAL'2 days'),
('CAC','NULL','Request Ready for CAC Review','Pre-Funding request PR-2026-NIG-0024 is ready for CAC approval.','PR-2026-NIG-0024',false,NOW()-INTERVAL'3 days'),
('Treasury','NULL','CAC Approved - Treasury Action Required','Request PR-2026-NIG-0023 approved by CAC. Awaiting Treasury authorization.','PR-2026-NIG-0023',false,NOW()-INTERVAL'4 days'),
('SG_AP','NULL','Request Ready for Execution','Request PR-2026-NIG-0021 is ready for payment execution.','PR-2026-NIG-0021',false,NOW()-INTERVAL'2 days');
