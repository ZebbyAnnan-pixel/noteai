-- Add new document types to the CHECK constraint
ALTER TABLE documents DROP CONSTRAINT documents_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_type_check 
  CHECK (type IN ('pdf', 'text', 'link', 'doc', 'image', 'file'));