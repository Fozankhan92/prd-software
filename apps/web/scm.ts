export type ScmShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'exception';

export interface ScmShipment {
  id: string;
  tenantId: string;
  orderId?: string;
  carrier?: string;
  trackingReference?: string;
  status: ScmShipmentStatus;
  createdAt: string;
}

export interface ScmDirectory {
  listShipments(tenantId: string): Promise<readonly ScmShipment[]>;
}
