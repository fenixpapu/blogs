import schedule
import time
from prometheus_client import start_http_server, Counter

currency = Counter('interest_per_currency', "số tiền hiện có", ['Unit'])
currency.labels("VND").inc(1)
currency.labels("USD").inc(23)


def job():
    currency.labels("VND").inc(1)
    currency.labels("USD").inc(1)


# schedule.every(1).minutes.do(job)
# schedule.every().day.at("19:00").do(job)


def main():
    start_http_server(8192)
    while True:
        job()
        time.sleep(60)


main()
