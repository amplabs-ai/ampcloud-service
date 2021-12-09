from src.app.validator import fetch_schema

def test_fetch_schema():
    cell_lists_path = "/bas/data/01_raw/default_user/data_set_samples/cycle/Arbin_example/Arbin_example.xlsx"
    fetch_schema('Arbin', cell_lists_path)
    assert True