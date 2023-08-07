import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

@Injectable()
export class MaiHttpService {
  private cookie: string = '';

  constructor(private readonly httpService: HttpService) {}
  async getHtmlFromServer({
    url,
    params,
  }: {
    url: string;
    params: { [key: string]: string };
  }): Promise<string> {
    const response1: AxiosResponse<string> = await this.httpService.axiosRef.get(url, {
      headers: {
        cookie: this.cookie,
      },
      params,
    });

    if (!response1.headers['set-cookie']?.length || response1.headers['set-cookie'].length === 0) {
      const result = response1.data.match(/ckcheck=(\d{10,30});/gm);
      if (!Array.isArray(result)) return '';
      this.cookie = `schedule-group-cache=1.3; ${result[0]}`;
      const response2: AxiosResponse<string> = await this.httpService.axiosRef.get(url, {
        headers: {
          cookie: this.cookie,
        },
        params,
      });
      return response2.data;
    }
    return response1.data;
  }
}
