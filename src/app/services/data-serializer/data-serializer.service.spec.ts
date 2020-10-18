import { TestBed } from '@angular/core/testing';

import { DataSerializerService } from './data-serializer.service';

describe('DataSerializerService', () => {
  let service: DataSerializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSerializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
