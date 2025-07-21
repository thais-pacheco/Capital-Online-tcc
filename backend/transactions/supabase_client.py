import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_KEY')
        self.client = create_client(self.url, self.key)
    
    def get_transactions(self):
        return self.client.from_('transactions').select('*').execute()
    
    def create_transaction(self, transaction_data):
        return self.client.from_('transactions').insert(transaction_data).execute()