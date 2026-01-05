# Test Files for PromptLab Upload Feature

This directory contains test files to verify the upload-ingest bug fixes.

## Valid Test Files

### `test-batch-valid.json`
A properly formatted JSON test batch with 5 test cases including metadata.
- **Use case**: Test normal upload flow
- **Expected**: Should parse successfully with 5 tests (3 fail, 2 pass)

### `test-batch-valid.csv`
The same test batch in CSV format with JSON metadata in the metadata column.
- **Use case**: Test CSV parsing with JSON metadata
- **Expected**: Should parse successfully with 5 tests

### `sample-system-prompt.txt`
A sample system prompt for a customer service AI.
- **Use case**: Copy/paste this into the system prompt field when creating a project

## Edge Case Test Files (for testing bug fixes)

### `test-empty.json`
Completely empty file.
- **Use case**: Test empty file validation (Bug #9)
- **Expected error**: "JSON file is empty"

### `test-empty-array.json`
Valid JSON but with an empty tests array.
- **Use case**: Test empty data validation (Bug #9)
- **Expected error**: "JSON file 'tests' array is empty"

### `test-invalid-json.json`
File with invalid JSON syntax.
- **Use case**: Test JSON syntax error handling (Bug #8)
- **Expected error**: "Invalid JSON syntax: Unexpected token..."

### `test-malformed-metadata.csv`
CSV file with invalid JSON in the metadata column.
- **Use case**: Test metadata parsing error handling (Bug #2)
- **Expected error**: "Invalid JSON in metadata field for test 'test-001': ..."

## Testing Checklist

- [ ] Upload `test-batch-valid.json` - should work ✅
- [ ] Upload `test-batch-valid.csv` - should work ✅
- [ ] Upload `test-empty.json` - should show clear error message ❌
- [ ] Upload `test-empty-array.json` - should show clear error message ❌
- [ ] Upload `test-invalid-json.json` - should show clear error message ❌
- [ ] Upload `test-malformed-metadata.csv` - should show specific metadata error ❌
- [ ] Click upload box - file dialog should open 🖱️
- [ ] Drag and drop file - should work 🖱️

## Notes

Excel test files are not included because they require binary file generation. You can create one manually:
1. Open Excel or Google Sheets
2. Create columns: id, status, transcript, expected_behavior, actual_behavior, metadata
3. Add a few rows with data
4. Save as .xlsx
5. Upload to test Excel parsing
