import os
from datetime import datetime

class HelperFunctions:
    @staticmethod
    def create_cef_logs_folders():
        date_str = str(datetime.now().date())
        if not os.path.exists('logs/' + date_str + '/'):
            os.makedirs('logs/' + date_str + '/')
        if not os.path.exists('logs/' + date_str + '/buffet.log'):
            with open('logs/' + date_str + '/buffet.log', 'w', encoding='utf-8') as f:
                f.write('')