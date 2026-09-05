import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2px solid #3B82F6',
    paddingBottom: 12,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  companyAddress: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'right',
  },
  clientBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clientTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clientRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  clientLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
    width: 70,
  },
  clientValue: {
    fontSize: 10,
    color: '#0F172A',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: 8,
  },
  metaItem: {
    minWidth: 80,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 1,
  },
  metaValue: {
    fontSize: 10,
    color: '#0F172A',
  },
  table: {
    width: '100%',
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 6,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 5,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    paddingHorizontal: 4,
  },
  colDesc: { width: '38%', fontSize: 9, paddingHorizontal: 4 },
  colQty: {
    width: '12%',
    fontSize: 9,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  colPrice: {
    width: '15%',
    fontSize: 9,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  colDisc: {
    width: '15%',
    fontSize: 9,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  colTotal: {
    width: '20%',
    fontSize: 9,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  totalsBox: {
    marginTop: 12,
    alignItems: 'flex-end',
    borderTop: '1px solid #CBD5E1',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
    paddingVertical: 3,
  },
  totalLabel: { fontSize: 9, fontWeight: 'medium' },
  totalValue: { fontSize: 9 },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
    paddingVertical: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    marginTop: 3,
    borderRadius: 4,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  notes: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1px solid #E2E8F0',
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 9,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTop: '1px solid #E2E8F0',
    paddingTop: 8,
  },
});

export default function EstimatePDF({ formData, totals }) {
  const {
    estimateNo,
    date,
    validUntil,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    items,
    notes,
    terms,
    currency = '€',
  } = formData;

  const subtotal = totals?.subtotal || 0;
  const taxAmount = totals?.taxAmount || 0;
  const total = totals?.total || 0;
  const taxRate = formData?.taxRate || 10;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Mahadi Express</Text>
            <Text style={styles.companyAddress}>
              5 RES DES TROIS FORETS., 78380 Bougival, France
            </Text>
          </View>
          <Text style={styles.documentTitle}>ESTIMATE</Text>
        </View>

        {/* Client Info with Labels */}
        <View style={styles.clientBox}>
          <Text style={styles.clientTitle}>Client Information</Text>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Name:</Text>
            <Text style={styles.clientValue}>
              {clientName || '___________'}
            </Text>
          </View>
          {clientEmail && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Email:</Text>
              <Text style={styles.clientValue}>{clientEmail}</Text>
            </View>
          )}
          {clientPhone && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Phone:</Text>
              <Text style={styles.clientValue}>{clientPhone}</Text>
            </View>
          )}
          {clientAddress && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Address:</Text>
              <Text style={styles.clientValue}>{clientAddress}</Text>
            </View>
          )}
        </View>

        {/* Meta Info with Labels */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Estimate No</Text>
            <Text style={styles.metaValue}>{estimateNo}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Valid Until</Text>
            <Text style={styles.metaValue}>{validUntil}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>Draft</Text>
          </View>
        </View>

        {/* Items Table with Headers */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.tableHeaderText]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>QTY</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>PRICE</Text>
            <Text style={[styles.colDisc, styles.tableHeaderText]}>
              DISCOUNT %
            </Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>TOTAL</Text>
          </View>
          {items.map((item, idx) => {
            const total =
              (item.quantity || 0) *
              (item.price || 0) *
              (1 - (item.discount || 0) / 100);
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colDesc}>{item.description || '-'}</Text>
                <Text style={styles.colQty}>{item.quantity || 0}</Text>
                <Text style={styles.colPrice}>
                  {(item.price || 0).toFixed(2)}
                </Text>
                <Text style={styles.colDisc}>
                  {(item.discount || 0).toFixed(0)}%
                </Text>
                <Text style={styles.colTotal}>{total.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals with Labels */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {subtotal.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({taxRate}%)</Text>
            <Text style={styles.totalValue}>
              {taxAmount.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL</Text>
            <Text>
              {total.toFixed(2)} {currency}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {(notes || terms) && (
          <View style={styles.notes}>
            {notes && (
              <>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{notes}</Text>
              </>
            )}
            {terms && (
              <>
                <Text style={[styles.notesLabel, { marginTop: 6 }]}>
                  Terms:
                </Text>
                <Text style={styles.notesText}>{terms}</Text>
              </>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Thank you for considering our service. This estimate is valid for 30
            days.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
