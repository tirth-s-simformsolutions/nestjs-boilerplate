export declare const commonConfig: {
  KEY: string;
  asProvider(): {
    imports: [
      ReturnType<typeof import('@nestjs/config').ConfigModule.forFeature>,
    ];
    useFactory: (config: { url: string }) => {
      url: string;
    };
    inject: [string];
  };
};
